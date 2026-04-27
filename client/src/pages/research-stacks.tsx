import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SEOHead } from "@/components/seo-head";
import { STACK_COMPONENTS, buildPriceLookup, calculateStackPricing } from "@/lib/stack-pricing";
import { CategoryTabs } from "@/components/category-tabs";
import { Layers, FlaskConical, ArrowRight, Sparkles, Zap, Heart, Leaf, Star, Crown, Shield, X, Check, ShoppingCart, Beaker, Brain, Target, Rocket, Activity, Moon, Dumbbell, Timer, Save, Share2, Trash2, Copy, Users, LucideIcon, Search, AlertCircle, ChevronUp, ChevronDown, Monitor, GitMerge } from "lucide-react";
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
import {
  detectPathwayOverlaps,
  findOverlapForPair,
} from "@/lib/pathway-overlaps";
import { PathwayOverlapCard } from "@/components/pathway-overlap-card";
import { RESEARCH_STACKS_DATA } from "@/data/research-stacks";
import type { SynergyCopy, StackIconName } from "@/data/research-stacks";
import { KNOWN_STACKS } from "@/data/known-stacks";
import type { KnownStack } from "@/data/known-stacks";
import { PEPTIDE_PATHWAYS } from "@/data/peptide-pathways";
import type { PeptidePathway } from "@/data/peptide-pathways";

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
  synergy: SynergyCopy;
  intentionalOverlap?: boolean;
}

const STACK_ICON_MAP: Record<StackIconName, typeof FlaskConical> = {
  Heart,
  Zap,
  Sparkles,
  Brain,
  Leaf,
  Crown,
  FlaskConical,
  Dumbbell,
};

const researchStacks: ResearchStack[] = RESEARCH_STACKS_DATA.map((s) => ({
  id: s.id,
  name: s.name,
  subtitle: s.subtitle,
  description: s.description,
  peptides: s.peptides.map((p) => p.name),
  icon: STACK_ICON_MAP[s.iconName] ?? FlaskConical,
  color: s.color,
  badge: s.badge,
  badgeColor: s.badgeColor,
  synergy: s.synergy,
  intentionalOverlap: s.intentionalOverlap,
}));

type StackTab = "pre-built" | "custom";

// ============================================
// SYNERGY SYSTEM - Known Combos & Pathways
// ============================================


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
  "Melanogenesis Modulation": "Regulation of melanin production for even skin pigmentation and tone",
  "CD44 Receptor": "Primary hyaluronan receptor mediating cell adhesion, migration, and tissue hydration signaling",
  "Extracellular Matrix Hydration": "Water retention within tissue scaffolding for structural support and elasticity",
  "Sirtuin Activation": "NAD+-dependent deacetylase enzymes regulating DNA repair and metabolic homeostasis",
  "PARP DNA Repair": "Poly(ADP-ribose) polymerase-mediated detection and repair of DNA strand breaks",
  "Acetylcholine Inhibition": "Blocking acetylcholine release at neuromuscular junctions to reduce muscle contraction",
  "Cardiolipin Binding": "Stabilization of inner mitochondrial membrane lipid essential for electron transport",
  "Mitochondrial Electron Transport": "Energy-producing chain of redox reactions within mitochondria",
  "ROS Scavenging": "Neutralization of reactive oxygen species to prevent oxidative cell damage",
  "Glutathione Peroxidase": "Enzyme system reducing hydrogen peroxide and lipid hydroperoxides",
  "Phase II Detoxification": "Conjugation reactions that neutralize and prepare toxins for elimination",
  "Redox Homeostasis": "Maintaining the balance between oxidants and antioxidants for cellular health",
  "Sleep Architecture": "Neural patterns governing sleep stage cycling and deep restorative sleep",
  "Myostatin Inhibition": "Blocking the primary negative regulator of skeletal muscle mass",
  "Activin Signaling": "TGF-beta superfamily member regulating muscle and tissue growth",
  "Muscle Hypertrophy": "Increase in muscle fiber size through protein synthesis activation",
  "Prohibitin Targeting": "Selective targeting of blood vessels supplying white adipose tissue",
  "Vascular Disruption": "Cutting blood supply to targeted tissue for controlled reduction",
  "Apoptosis": "Programmed cell death pathway for eliminating damaged or unwanted cells",
  "Prostaglandin E1": "Lipid compound mediating vasodilation and smooth muscle relaxation",
  "cAMP Signaling": "Cyclic AMP second messenger system for intracellular signal transduction",
  "Innate Repair Receptor": "Tissue-protective receptor mediating repair without erythropoiesis",
  "Amylin Receptor": "Receptor for amylin hormone regulating satiety and gastric emptying",
  "Appetite Regulation": "Central nervous system pathways controlling hunger and satiety signals",
  "Gastric Emptying": "Rate control of stomach content release into the small intestine",
  "FOXO4-p53 Disruption": "Breaking the interaction keeping senescent cells alive",
  "Senescence Clearance": "Selective removal of zombie cells that drive aging and inflammation",
  "Appetite Stimulation": "Ghrelin-mediated hunger signal activation from the hypothalamus",
  "GnRH Receptor": "Gonadotropin-releasing hormone receptor on pituitary gonadotrophs",
  "LH Release": "Luteinizing hormone secretion for testosterone and ovulation",
  "FSH Release": "Follicle-stimulating hormone secretion for gamete production",
  "LH Receptor": "Luteinizing hormone receptor on Leydig and theca cells",
  "Testosterone Stimulation": "Direct stimulation of testosterone biosynthesis",
  "Leydig Cell Activation": "Stimulating testicular cells responsible for androgen production",
  "FSH Signaling": "Follicle-stimulating hormone pathway for germ cell maturation",
  "LH Signaling": "Luteinizing hormone pathway for steroidogenesis and reproductive function",
  "Gonadal Stimulation": "Combined hormonal stimulation of reproductive glands",
  "Cardioprotection": "Protective mechanisms against cardiac ischemia and cell death",
  "Reproductive Axis": "Hypothalamic-pituitary-gonadal axis controlling reproduction",
  "MC1R Activation": "Melanocortin 1 receptor stimulation for melanin production",
  "Melatonin Receptor": "MT1/MT2 receptor activation for circadian and sleep regulation",
  "Circadian Rhythm": "Internal biological clock governing sleep-wake and metabolic cycles",
  "Antioxidant Defense": "Cellular systems neutralizing free radicals and oxidative stress",
  "Satellite Cell Activation": "Muscle stem cell recruitment for fiber repair and growth",
  "Muscle Repair": "Coordinated regeneration of damaged skeletal muscle fibers",
  "Oxytocin Receptor": "Neuropeptide receptor mediating social bonding and stress reduction",
  "Social Bonding": "Neurochemical pathways promoting trust and social connection",
  "p53 Activation": "Tumor suppressor protein activation for cancer cell elimination",
  "HDM2 Binding": "Interaction with p53 regulatory protein to restore tumor suppression",
  "Membrane Disruption": "Physical disruption of cell membrane integrity in targeted cells",
  "MC4R Activation": "Melanocortin 4 receptor stimulation in CNS for arousal pathways",
  "Melanocortin Signaling": "Neuropeptide pathway regulating pigmentation, energy, and behavior",
  "ERRα Activation": "Estrogen-related receptor alpha pathway mimicking exercise adaptations",
  "VPAC Receptor": "Vasoactive intestinal peptide receptor for vasodilation and immune modulation",
  "Neuroprotection": "Mechanisms protecting neurons from degeneration and injury",
  "Vasodilation": "Relaxation of blood vessel walls to increase blood flow",
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
    if (normalized.includes(key.replace(/[^a-z0-9]/g, ''))) {
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
      normalizedSelected.some(s => s.includes(p.replace(/[^a-z0-9]/g, '')))
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
      normalizedSelected.some(s => s.includes(p.replace(/[^a-z0-9]/g, '')))
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
      normalizedSelected.some(s => s.includes(p.replace(/[^a-z0-9]/g, '')))
    ).length;
    
    const missing = stack.peptides.filter(p => 
      !normalizedSelected.some(s => s.includes(p.replace(/[^a-z0-9]/g, '')))
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
    { partner: "ipamorelin", reason: "Metabolic + GH support for body composition optimization", boost: "Metabolic" },
    { partner: "cjc-1295", reason: "AMPK metabolic drive + sustained GH release synergy", boost: "Metabolic" },
    { partner: "aod-9604", reason: "Mitochondrial fat oxidation + GH fragment lipolysis", boost: "Metabolic" },
    { partner: "5-amino-1mq", reason: "AMPK activation + NNMT enzyme targeting for dual fat metabolism", boost: "Metabolic" },
    { partner: "nad-precursor", reason: "Mitochondrial biogenesis + NAD+ cellular energy restoration", boost: "Longevity" },
  ],
  "rr-a3": [
    { partner: "mots-c", reason: "Triple agonist + mitochondrial activator", boost: "Metabolic" },
    { partner: "5-amino-1mq", reason: "Fat metabolism through complementary pathways", boost: "Metabolic" },
    { partner: "aod-9604", reason: "Incretin signaling + targeted fat reduction", boost: "Metabolic" },
    { partner: "bpc-157", reason: "Gut cytoprotection supports GI comfort during metabolic research", boost: "Metabolic" },
    { partner: "ipamorelin", reason: "Metabolic signaling + GH pulse for body composition", boost: "Growth" },
  ],
  "ipamorelin": [
    { partner: "cjc-1295", reason: "GH pulse + sustained release — the gold standard GH stack", boost: "Growth" },
    { partner: "tb-500", reason: "Growth hormone + tissue repair acceleration", boost: "Healing" },
    { partner: "sermorelin", reason: "Complementary GH secretagogue pathways", boost: "Growth" },
    { partner: "bpc-157", reason: "Selective GH/IGF-1 amplifies BPC-157 tissue repair", boost: "Healing" },
    { partner: "mots-c", reason: "GH support + AMPK metabolic drive for body composition", boost: "Metabolic" },
    { partner: "rr-a3", reason: "GH pulse + metabolic receptor agonism for composition research", boost: "Metabolic" },
    { partner: "epithalon", reason: "Deep sleep GH pulse + circadian rhythm optimization", boost: "Sleep" },
    { partner: "ghk-cu", reason: "GH-driven collagen + copper-peptide matrix remodeling", boost: "Skin" },
    { partner: "igf-1 lr3", reason: "Endogenous GH release + direct IGF-1 for anabolic synergy", boost: "Growth" },
  ],
  "cjc-1295": [
    { partner: "ipamorelin", reason: "GHRH + ghrelin receptor for amplified GH release", boost: "Growth" },
    { partner: "tesamorelin", reason: "Dual GHRH analogs for sustained growth support", boost: "Growth" },
    { partner: "mots-c", reason: "Growth + metabolic optimization", boost: "Metabolic" },
    { partner: "sermorelin", reason: "Complementary GHRH signaling for sustained GH output", boost: "Growth" },
    { partner: "tb-500", reason: "Sustained GH release + systemic tissue repair", boost: "Healing" },
    { partner: "bpc-157", reason: "GH amplification supports tissue repair pathways", boost: "Healing" },
    { partner: "igf-1 lr3", reason: "Endogenous GH axis + direct IGF-1 for dual anabolic signal", boost: "Growth" },
  ],
  "epithalon": [
    { partner: "ghk-cu", reason: "Telomere protection + tissue renewal", boost: "Longevity" },
    { partner: "ipamorelin", reason: "Circadian rhythm + deep sleep GH pulse", boost: "Sleep" },
    { partner: "foxo4", reason: "Telomerase + senolytic for comprehensive anti-aging", boost: "Longevity" },
    { partner: "thymalin", reason: "Thymic restoration + telomerase — Russian longevity protocol", boost: "Longevity" },
    { partner: "dsip", reason: "Sleep architecture + pineal melatonin regulation", boost: "Sleep" },
    { partner: "ss-31", reason: "Telomere protection + mitochondrial membrane stabilization", boost: "Longevity" },
    { partner: "nad-precursor", reason: "Telomerase + NAD+ restoration for cellular rejuvenation", boost: "Longevity" },
    { partner: "glutathione", reason: "Telomere protection + master antioxidant defense", boost: "Longevity" },
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
    { partner: "epithalon", reason: "Sleep architecture + pineal function", boost: "Longevity" },
    { partner: "selank", reason: "Calm mind + restorative sleep", boost: "Cognitive" },
    { partner: "ipamorelin", reason: "Delta sleep induction + sleep-phase GH release", boost: "Sleep" },
  ],
  "foxo4": [
    { partner: "epithalon", reason: "Senolytic + telomerase — advanced longevity protocol", boost: "Longevity" },
    { partner: "ss-31", reason: "Cellular cleanup + mitochondrial protection", boost: "Longevity" },
    { partner: "nad-precursor", reason: "Senescent cell clearance + NAD+ restoration for cellular renewal", boost: "Longevity" },
    { partner: "glutathione", reason: "Senolytic action + antioxidant defense for cellular health", boost: "Longevity" },
  ],
  "ss-31": [
    { partner: "mots-c", reason: "Dual mitochondrial support peptides", boost: "Longevity" },
    { partner: "foxo4", reason: "Mitochondrial health + senescent cell clearance", boost: "Longevity" },
    { partner: "epithalon", reason: "Mitochondrial membrane stability + telomere maintenance", boost: "Longevity" },
    { partner: "nad-precursor", reason: "Electron transport chain optimization + NAD+ restoration", boost: "Longevity" },
    { partner: "glutathione", reason: "Mitochondrial antioxidant + systemic redox balance", boost: "Longevity" },
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
    { partner: "rr-a3", reason: "GH fragment lipolysis + triple receptor metabolic control", boost: "Metabolic" },
    { partner: "ipamorelin", reason: "Targeted fat reduction + GH-driven metabolism", boost: "Metabolic" },
  ],
  "5-amino-1mq": [
    { partner: "aod-9604", reason: "NNMT inhibition + GH fragment for fat metabolism", boost: "Metabolic" },
    { partner: "mots-c", reason: "Enzyme targeting + mitochondrial activation", boost: "Metabolic" },
    { partner: "rr-a3", reason: "NNMT inhibition + triple metabolic receptor agonism", boost: "Metabolic" },
    { partner: "nad-precursor", reason: "NNMT inhibition preserves NAD+ levels for cellular energy", boost: "Metabolic" },
  ],
  "sermorelin": [
    { partner: "ipamorelin", reason: "GHRH analog + ghrelin mimetic for synergistic GH release", boost: "Growth" },
    { partner: "cjc-1295", reason: "Complementary GHRH signaling pathways", boost: "Growth" },
    { partner: "tb-500", reason: "GH secretagogue + systemic tissue repair acceleration", boost: "Healing" },
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
    { partner: "cjc-1295", reason: "Direct IGF-1 + sustained GHRH for layered anabolic signaling", boost: "Growth" },
  ],
  "glutathione": [
    { partner: "nad-precursor", reason: "Master antioxidant + NAD+ for cellular detox and energy", boost: "Longevity" },
    { partner: "epithalon", reason: "Redox balance + telomerase for anti-aging defense", boost: "Longevity" },
    { partner: "bpc-157", reason: "Antioxidant protection + tissue repair support", boost: "Healing" },
    { partner: "ghk-cu", reason: "Detoxification support + copper-peptide tissue renewal", boost: "Longevity" },
    { partner: "ss-31", reason: "Systemic redox balance + mitochondrial antioxidant", boost: "Longevity" },
    { partner: "foxo4", reason: "Antioxidant defense + senescent cell clearance", boost: "Longevity" },
  ],
  "nad-precursor": [
    { partner: "glutathione", reason: "NAD+ restoration + master antioxidant for cellular health", boost: "Longevity" },
    { partner: "epithalon", reason: "NAD+ salvage pathway + telomerase activation synergy", boost: "Longevity" },
    { partner: "mots-c", reason: "NAD+ support + mitochondrial biogenesis for energy production", boost: "Longevity" },
    { partner: "ss-31", reason: "NAD+ restoration + electron transport chain optimization", boost: "Longevity" },
    { partner: "foxo4", reason: "NAD+ cellular energy + senolytic clearance", boost: "Longevity" },
    { partner: "5-amino-1mq", reason: "NAD+ preservation via NNMT inhibition synergy", boost: "Metabolic" },
  ],
  "glow-peptide-complex": [
    { partner: "ghk-cu", reason: "Multi-peptide skin rejuvenation + copper collagen synthesis", boost: "Skin" },
    { partner: "snap-8", reason: "Skin brightening + expression line reduction", boost: "Skin" },
    { partner: "bpc-157", reason: "Skin rejuvenation + vascular repair support", boost: "Skin" },
  ],
  "klow-peptide-complex": [
    { partner: "bpc-157", reason: "Anti-inflammatory blend + gut lining cytoprotection", boost: "Healing" },
    { partner: "ghk-cu", reason: "Gut-skin axis modulation + collagen remodeling", boost: "Skin" },
    { partner: "kpv", reason: "NF-κB inhibition stack for comprehensive inflammation control", boost: "Healing" },
    { partner: "tb-500", reason: "Tissue regeneration blend + systemic healing support", boost: "Healing" },
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
      const missingNorm = missingPeptide.replace(/[^a-z0-9]/g, '');
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
            if (normalized.includes(key.replace(/[^a-z0-9]/g, ''))) {
              const match = pairs.find(p => p.partner.replace(/[^a-z0-9]/g, '') === missingNorm);
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
      if (normalized.includes(key.replace(/[^a-z0-9]/g, ''))) {
        for (const pair of pairs) {
          const partnerNorm = pair.partner.replace(/[^a-z0-9]/g, '');
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
  "cagrilintide": [{ label: "Metabolic", color: "#E7FB10", icon: Zap }],
  "cerebrolysin": [{ label: "Cognitive", color: "#21d8ff", icon: Brain }],
  "dsip": [{ label: "Sleep", color: "#8b5cf6", icon: Moon }],
  "foxo4": [{ label: "Longevity", color: "#a855f7", icon: Crown }],
  "ghrp-2": [{ label: "Growth", color: "#f59e0b", icon: Zap }],
  "ghrp-6": [{ label: "Growth", color: "#f59e0b", icon: Zap }],
  "glow": [{ label: "Skin", color: "#ec4899", icon: Sparkles }],
  "glutathione": [{ label: "Longevity", color: "#a855f7", icon: Shield }],
  "gonadorelin": [{ label: "Hormonal", color: "#f59e0b", icon: Activity }],
  "hexarelin": [{ label: "Growth", color: "#f59e0b", icon: Zap }],
  "igf-1":  [{ label: "Growth", color: "#f59e0b", icon: Dumbbell }],
  "igf-des": [{ label: "Growth", color: "#f59e0b", icon: Dumbbell }],
  "klow": [{ label: "Skin", color: "#ec4899", icon: Sparkles }],
  "kpv": [{ label: "Healing", color: "#22c55e", icon: Shield }, { label: "Skin", color: "#ec4899", icon: Sparkles }, { label: "Longevity", color: "#a855f7", icon: Crown }],
  "kisspeptin": [{ label: "Hormonal", color: "#f59e0b", icon: Activity }],
  "ll-37": [{ label: "Immune", color: "#22c55e", icon: Shield }],
  "mgf": [{ label: "Growth", color: "#f59e0b", icon: Dumbbell }],
  "peg-mgf": [{ label: "Growth", color: "#f59e0b", icon: Dumbbell }],
  "mazdutide": [{ label: "Metabolic", color: "#E7FB10", icon: Zap }],
  "melanotan": [{ label: "Skin", color: "#ec4899", icon: Sparkles }],
  "oxytocin": [{ label: "Hormonal", color: "#f59e0b", icon: Heart }],
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
interface PathwayMapProps {
  selectedPeptides: { name: string; slug?: string | null }[];
}

function PathwayMap({ selectedPeptides }: PathwayMapProps) {
  const [clickedConnection, setClickedConnection] = useState<string | null>(null);
  const [clickedNode, setClickedNode] = useState<string | null>(null);
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const activeConnection = clickedConnection || hoveredConnection;
  const activeNode = clickedNode || hoveredNode;
  const containerRef = useRef<HTMLDivElement>(null);

  const peptideData = selectedPeptides
    .map(p => {
      const pathway = getPeptidePathway(p.name);
      return pathway
        ? { ...pathway, originalName: p.name, slug: p.slug ?? null }
        : null;
    })
    .filter(
      (p): p is PeptidePathway & { originalName: string; slug: string | null } =>
        p !== null,
    );

  const triggeredOverlaps = useMemo(
    () =>
      detectPathwayOverlaps(
        selectedPeptides
          .map((p) => p.slug)
          .filter((s): s is string => Boolean(s)),
      ),
    [selectedPeptides],
  );

  const hasActiveData = peptideData.length >= 1;

  const SYSTEM_COLORS: Record<string, string> = {
    healing: "#22c55e", gut: "#22c55e", joints: "#22c55e",
    metabolic: "#E7FB10", energy: "#E7FB10", weight: "#E7FB10",
    growth: "#f59e0b", muscle: "#f59e0b",
    cognitive: "#21d8ff", focus: "#21d8ff", neuroprotection: "#21d8ff", mood: "#21d8ff",
    skin: "#ec4899", cosmetic: "#ec4899", hair: "#ec4899",
    longevity: "#a855f7", sleep: "#8b5cf6",
    immune: "#34d399", recovery: "#60a5fa",
    hormonal: "#f59e0b", heart: "#ef4444", vascular: "#ef4444",
  };

  const getPrimaryColor = (systems: string[]) => {
    for (const s of systems) {
      const c = SYSTEM_COLORS[s.toLowerCase()];
      if (c) return c;
    }
    return "#21d8ff";
  };

  const svgWidth = 900;
  const svgHeight = 320;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2 - 10;

  const starfield = Array.from({ length: 60 }, (_, i) => ({
    x: (i * 97 + 13) % svgWidth,
    y: (i * 53 + 7) % (svgHeight - 40),
    r: 0.3 + (i % 4) * 0.3,
    opacity: 0.15 + (i % 5) * 0.08,
    delay: (i % 7) * 0.5,
  }));

  const ghostNodes = [
    { x: 130, y: centerY - 30, color: "#22c55e", label: "?" },
    { x: 330, y: centerY + 25, color: "#21d8ff", label: "?" },
    { x: 530, y: centerY - 15, color: "#a855f7", label: "?" },
    { x: 700, y: centerY + 20, color: "#22c55e", label: "?" },
    { x: 820, y: centerY - 25, color: "#21d8ff", label: "?" },
  ];

  const ghostConnections = [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 0, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 4 },
  ];

  const ghostParticles = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    x: Math.random() * svgWidth,
    y: Math.random() * svgHeight,
    r: 0.6 + Math.random() * 1.2,
    dur: 8 + Math.random() * 12,
    dx: (Math.random() - 0.5) * 120,
    dy: (Math.random() - 0.5) * 60,
    opacity: 0.15 + Math.random() * 0.25,
    delay: Math.random() * 5,
    color: ["#22c55e", "#21d8ff", "#a855f7"][i % 3],
  })), [svgWidth, svgHeight]);

  const nodes = hasActiveData ? peptideData.map((p, i) => {
    const count = peptideData.length;
    const spread = Math.min(svgWidth * 0.65, count * 200);
    const startX = count === 1 ? centerX : centerX - spread / 2;
    const step = count > 1 ? spread / (count - 1) : 0;
    const yPatterns: Record<number, number[]> = {
      1: [0],
      2: [-25, 25],
      3: [-40, 30, -40],
      4: [-45, 35, -35, 45],
    };
    const yOffsets = yPatterns[count] || yPatterns[4]!;
    const yOffset = yOffsets[i] || 0;
    return {
      x: startX + step * i,
      y: centerY + yOffset,
      name: p.name,
      pathways: p.pathways,
      systems: p.systems,
      color: getPrimaryColor(p.systems),
    };
  }) : [];

  type SynergyTier = "legendary" | "strong" | "good" | "pathway";
  const getTier = (score: number): SynergyTier => score >= 85 ? "legendary" : score >= 70 ? "strong" : "good";
  const TIER_COLORS: Record<SynergyTier, string> = {
    legendary: "#fbbf24",
    strong: "#21d8ff",
    good: "#6b7280",
    pathway: "#22c55e",
  };

  interface MapConnection {
    from: number;
    to: number;
    pathways: string[];
    strength: number;
    tier: SynergyTier;
    synergyScore: number;
    stackName?: string;
    stackColor?: string;
    reason?: string;
  }

  const connections: MapConnection[] = [];
  if (hasActiveData && peptideData.length >= 2) {
    for (let i = 0; i < peptideData.length; i++) {
      for (let j = i + 1; j < peptideData.length; j++) {
        const shared = peptideData[i].pathways.filter(p => peptideData[j].pathways.includes(p));
        const normI = normalizePeptideName(peptideData[i].originalName);
        const normJ = normalizePeptideName(peptideData[j].originalName);

        let pairingReason = "";
        let pairingBoost = "";
        for (const [key, pairs] of Object.entries(PEPTIDE_PAIRINGS)) {
          const keyNorm = key.replace(/[^a-z0-9]/g, '');
          if (normI.includes(keyNorm)) {
            const match = pairs.find(p => normJ.includes(p.partner.replace(/[^a-z0-9]/g, '')));
            if (match) { pairingReason = match.reason; pairingBoost = match.boost; break; }
          }
          if (normJ.includes(keyNorm)) {
            const match = pairs.find(p => normI.includes(p.partner.replace(/[^a-z0-9]/g, '')));
            if (match) { pairingReason = match.reason; pairingBoost = match.boost; break; }
          }
        }

        let matchedStack: KnownStack | undefined;
        const selectedNorms = peptideData.map(p => normalizePeptideName(p.originalName));
        for (const stack of KNOWN_STACKS) {
          const stackNorms = stack.peptides.map(p => p.replace(/[^a-z0-9]/g, ''));
          const iInStack = stackNorms.some(sn => normI.includes(sn));
          const jInStack = stackNorms.some(sn => normJ.includes(sn));
          if (iInStack && jInStack) {
            const allPresent = stackNorms.every(sn => selectedNorms.some(sel => sel.includes(sn)));
            if (allPresent || stackNorms.length === 2) {
              matchedStack = stack;
              break;
            }
            if (!matchedStack || stack.synergyBonus > (matchedStack?.synergyBonus || 0)) {
              matchedStack = stack;
            }
          }
        }

        const synergyScore = matchedStack?.synergyBonus || (pairingReason ? 75 : 0);
        const hasPairing = !!pairingReason || !!matchedStack;

        if (shared.length > 0 || hasPairing) {
          const tier: SynergyTier = matchedStack ? getTier(matchedStack.synergyBonus) :
            pairingReason ? "good" : "pathway";
          const fallbackReason = shared.length > 0
            ? `Shared ${shared.slice(0, 2).join(" + ")}${shared.length > 2 ? ` + ${shared.length - 2} more` : ""} pathway${shared.length > 1 ? "s" : ""}`
            : "";
          connections.push({
            from: i,
            to: j,
            pathways: shared,
            strength: Math.max(shared.length, hasPairing ? 2 : 0),
            tier,
            synergyScore,
            stackName: matchedStack?.name,
            stackColor: matchedStack?.color,
            reason: pairingReason || matchedStack?.description || fallbackReason,
          });
        }
      }
    }
  }

  interface LabelBox {
    x: number;
    y: number;
    w: number;
    h: number;
    priority: number;
  }

  const resolveCollisions = (labels: LabelBox[]): LabelBox[] => {
    const sorted = [...labels].sort((a, b) => a.priority - b.priority);
    const placed: LabelBox[] = [];
    const pad = 6;

    const overlaps = (a: LabelBox, b: LabelBox): boolean => {
      return !(a.x + a.w / 2 + pad < b.x - b.w / 2 || a.x - a.w / 2 - pad > b.x + b.w / 2 ||
               a.y + a.h / 2 + pad < b.y - b.h / 2 || a.y - a.h / 2 - pad > b.y + b.h / 2);
    };

    for (const label of sorted) {
      let adjusted = { ...label };
      let attempts = 0;
      const maxAttempts = 36;
      const directions = 8;
      while (attempts < maxAttempts) {
        const hasCollision = placed.some(p => overlaps(adjusted, p));
        if (!hasCollision) break;
        const ring = Math.floor(attempts / directions) + 1;
        const step = ring * 26;
        const angle = (attempts % directions) * (2 * Math.PI / directions);
        adjusted = { ...adjusted, x: label.x + Math.cos(angle) * step, y: label.y + Math.sin(angle) * step };
        attempts++;
      }
      const margin = 15;
      adjusted.x = Math.max(margin + adjusted.w / 2, Math.min(svgWidth - margin - adjusted.w / 2, adjusted.x));
      adjusted.y = Math.max(margin + adjusted.h / 2, Math.min(svgHeight - margin - adjusted.h / 2, adjusted.y));
      placed.push(adjusted);
    }
    return placed;
  };

  const connLabelData: { connIdx: number; midX: number; midY: number; stackNameW: number; stackNameH: number; hasSynergy: boolean; hasReason: boolean }[] = [];
  connections.forEach((conn, ci) => {
    const fn = nodes[conn.from];
    const tn = nodes[conn.to];
    const midX = (fn.x + tn.x) / 2;
    const midY = (fn.y + tn.y) / 2;
    const stackNameW = conn.stackName ? (conn.stackName.length * 6 + 20) : 0;
    connLabelData.push({ connIdx: ci, midX, midY, stackNameW, stackNameH: 16, hasSynergy: conn.synergyScore > 0, hasReason: !!conn.reason && !conn.stackName });
  });

  const allLabelBoxes: (LabelBox & { type: string; idx: number })[] = [];
  connLabelData.forEach((cl, i) => {
    const conn = connections[cl.connIdx];
    if (conn.stackName) {
      allLabelBoxes.push({ x: cl.midX, y: cl.midY - 12, w: cl.stackNameW, h: cl.stackNameH, priority: conn.tier === "legendary" ? 0 : conn.tier === "strong" ? 1 : 2, type: "stack", idx: i });
    }
    if (cl.hasReason) {
      allLabelBoxes.push({ x: cl.midX, y: cl.midY - 18, w: 120, h: 14, priority: 5, type: "reason", idx: i });
    }
  });

  const resolvedLabels = resolveCollisions(allLabelBoxes);
  const labelPositions: Record<string, { x: number; y: number }> = {};
  resolvedLabels.forEach((lb, i) => {
    const orig = allLabelBoxes[i];
    labelPositions[`${orig.type}-${orig.idx}`] = { x: lb.x, y: lb.y };
  });

  const resolvedLabelBoxes: Record<string, LabelBox> = {};
  resolvedLabels.forEach((lb, i) => {
    const orig = allLabelBoxes[i];
    resolvedLabelBoxes[`${orig.type}-${orig.idx}`] = lb;
  });

  const synergyAvoidBoxes: LabelBox[] = [];
  connLabelData.forEach((cl, i) => {
    const conn = connections[cl.connIdx];
    if (cl.hasSynergy && nodes[conn.from] && nodes[conn.to]) {
      const stackLabel = labelPositions[`stack-${i}`];
      const stackBox = resolvedLabelBoxes[`stack-${i}`];
      const stackBoxHalf = stackBox ? stackBox.h / 2 : 0;
      const gap = 10;
      const sx = stackLabel ? stackLabel.x : cl.midX;
      const sy = stackLabel ? stackLabel.y + stackBoxHalf + gap + 6 : cl.midY + 24;
      labelPositions[`synergy-${i}`] = { x: sx, y: sy };
      synergyAvoidBoxes.push({ x: sx, y: sy, w: 65, h: 12, priority: 99 });
    }
  });

  const allPathwayNodes: { x: number; y: number; name: string; fromNode: number; toNode: number }[] = [];
  connections.forEach(conn => {
    const fromNode = nodes[conn.from];
    const toNode = nodes[conn.to];
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const perpNormX = -dy / len;
    const perpNormY = dx / len;
    conn.pathways.forEach((pathway, pi) => {
      const t = (pi + 1) / (conn.pathways.length + 1);
      const midX = fromNode.x + dx * t;
      const midY = fromNode.y + dy * t;
      const perpDist = 50 + pi * 30;
      const side = pi % 2 === 0 ? 1 : -1;
      const px = midX + perpNormX * perpDist * side;
      const py = midY + perpNormY * perpDist * side;
      allPathwayNodes.push({ x: px, y: Math.max(15, Math.min(svgHeight - 15, py)), name: pathway, fromNode: conn.from, toNode: conn.to });
    });
  });

  const nodeObstacles: LabelBox[] = nodes.map(n => ({
    x: n.x,
    y: n.y,
    w: 70,
    h: 70,
    priority: -1,
  }));

  const pwLabelBoxes: (LabelBox & { idx: number })[] = allPathwayNodes.map((pn, i) => ({
    x: pn.x,
    y: pn.y,
    w: Math.min(100, pn.name.length * 7.5 + 20),
    h: 28,
    priority: 10 + i,
    idx: i,
  }));
  const allBoxesForPw = [...resolvedLabels, ...synergyAvoidBoxes, ...nodeObstacles, ...pwLabelBoxes.map(b => ({ ...b, type: "pw", idx: b.idx }))];
  const resolvedPwLabels = resolveCollisions(allBoxesForPw);
  const pwPositions = resolvedPwLabels.slice(resolvedLabels.length + synergyAvoidBoxes.length + nodeObstacles.length);
  pwPositions.forEach((lb, i) => {
    if (i < allPathwayNodes.length) {
      allPathwayNodes[i].x = lb.x;
      allPathwayNodes[i].y = lb.y;
    }
  });

  const soloPathwayLabels: { x: number; y: number; name: string }[] = [];
  if (peptideData.length === 1 && nodes.length === 1) {
    const node = nodes[0];
    const pathways = peptideData[0].pathways;
    const angleStep = (2 * Math.PI) / Math.max(pathways.length, 1);
    const radius = 90;
    pathways.forEach((pathway, pi) => {
      const angle = -Math.PI / 2 + angleStep * pi;
      soloPathwayLabels.push({
        x: node.x + Math.cos(angle) * radius,
        y: node.y + Math.sin(angle) * radius,
        name: pathway,
      });
    });
  }

  const connKey = (from: number, to: number) => `${from}-${to}`;
  const maxStrength = Math.max(...connections.map(c => c.strength), 1);

  const handleNodeClick = (name: string) => {
    setClickedConnection(null);
    setClickedNode(prev => prev === name ? null : name);
  };
  const handleConnectionClick = (key: string) => {
    setClickedNode(null);
    setClickedConnection(prev => prev === key ? null : key);
  };

  const allSharedPathways = Array.from(new Set(connections.flatMap(c => c.pathways)));

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-xl overflow-hidden"
      style={{ background: "radial-gradient(ellipse at center, #0d1117 0%, #080b10 60%, #050709 100%)" }}
      data-testid="pathway-map"
    >
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(180deg, transparent 0%, rgba(34,197,94,0.03) 50%, transparent 100%)",
      }} />
      <div className="px-4 pt-2.5 pb-1.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Zap className="h-4 w-4 text-[#22c55e]" style={{ filter: "drop-shadow(0 0 6px rgba(34,197,94,0.6))" }} />
          </div>
          <div className="leading-tight">
            <h4 className="font-bold text-white tracking-wide text-[15px]" style={{ textShadow: "0 0 20px rgba(34,197,94,0.3)" }}>SYNERGY PATHWAY MAP</h4>
            {hasActiveData ? (
              <p className="text-[#22c55e]/70 flex items-center gap-1 text-[11px]">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                Interactive — hover or tap nodes & lines for details
              </p>
            ) : (
              <p className="text-[11px] text-gray-500">
                Select peptides below to visualize their connections
              </p>
            )}
          </div>
        </div>
        {allSharedPathways.length > 0 && (
          <Badge className="text-[12px] bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30" style={{ boxShadow: "0 0 8px rgba(34,197,94,0.2)" }}>
            {allSharedPathways.length} shared pathway{allSharedPathways.length !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>
      <div style={{ overflow: "hidden", position: "relative", paddingBottom: "12px" }}>
      <svg
        width="100%"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ minHeight: "180px", display: "block" }}
      >
        <defs>
          {connections.map(conn => {
            const tierColor = TIER_COLORS[conn.tier];
            const useStackColor = conn.stackColor && conn.tier === "legendary";
            const color = useStackColor ? conn.stackColor! : tierColor;
            const fn = nodes[conn.from];
            const tn = nodes[conn.to];
            const gid = `pm-grad-${conn.from}-${conn.to}`;
            return (
              <linearGradient key={gid} id={gid} x1={fn.x} y1={fn.y} x2={tn.x} y2={tn.y} gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={conn.tier === "pathway" ? fn.color : color} />
                <stop offset="50%" stopColor={color} />
                <stop offset="100%" stopColor={conn.tier === "pathway" ? tn.color : color} />
              </linearGradient>
            );
          })}
          {nodes.map((node, i) => (
            <radialGradient key={`pm-nglow-${i}`} id={`pm-nglow-${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={node.color} stopOpacity={0.4} />
              <stop offset="60%" stopColor={node.color} stopOpacity={0.1} />
              <stop offset="100%" stopColor={node.color} stopOpacity={0} />
            </radialGradient>
          ))}
          {ghostNodes.map((gn, i) => (
            <radialGradient key={`pm-ghost-glow-${i}`} id={`pm-ghost-glow-${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={gn.color} stopOpacity={0.15} />
              <stop offset="60%" stopColor={gn.color} stopOpacity={0.04} />
              <stop offset="100%" stopColor={gn.color} stopOpacity={0} />
            </radialGradient>
          ))}
          <radialGradient id="pm-arrow-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.25} />
            <stop offset="60%" stopColor="#22c55e" stopOpacity={0.08} />
            <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
          </radialGradient>
          <filter id="pm-glow-soft">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="pm-holo-gold" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={svgWidth} y2="0">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="35%" stopColor="#fbbf24" />
            <stop offset="45%" stopColor="#fde68a" />
            <stop offset="50%" stopColor="#fffbe6" />
            <stop offset="55%" stopColor="#fde68a" />
            <stop offset="65%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fbbf24" />
            <animateTransform attributeName="gradientTransform" type="translate" values={`-${svgWidth} 0; ${svgWidth} 0; ${svgWidth} 0`} keyTimes="0; 0.7; 1" dur="2.5s" repeatCount="indefinite" />
          </linearGradient>
          <linearGradient id="pm-holo-cyan" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={svgWidth} y2="0">
            <stop offset="0%" stopColor="#21d8ff" />
            <stop offset="35%" stopColor="#21d8ff" />
            <stop offset="45%" stopColor="#67e8f9" />
            <stop offset="50%" stopColor="#e0fbff" />
            <stop offset="55%" stopColor="#67e8f9" />
            <stop offset="65%" stopColor="#21d8ff" />
            <stop offset="100%" stopColor="#21d8ff" />
            <animateTransform attributeName="gradientTransform" type="translate" values={`-${svgWidth} 0; ${svgWidth} 0; ${svgWidth} 0`} keyTimes="0; 0.7; 1" dur="2.8s" repeatCount="indefinite" />
          </linearGradient>
          <linearGradient id="pm-holo-gray" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={svgWidth} y2="0">
            <stop offset="0%" stopColor="#9ca3af" />
            <stop offset="35%" stopColor="#9ca3af" />
            <stop offset="45%" stopColor="#d1d5db" />
            <stop offset="50%" stopColor="#f0f0f0" />
            <stop offset="55%" stopColor="#d1d5db" />
            <stop offset="65%" stopColor="#9ca3af" />
            <stop offset="100%" stopColor="#9ca3af" />
            <animateTransform attributeName="gradientTransform" type="translate" values={`-${svgWidth} 0; ${svgWidth} 0; ${svgWidth} 0`} keyTimes="0; 0.7; 1" dur="3s" repeatCount="indefinite" />
          </linearGradient>
          <filter id="pm-glow-strong">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="pm-glow-line">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="pm-glow-legendary">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {starfield.map((star, i) => (
          <motion.circle
            key={`star-${i}`}
            cx={star.x}
            cy={star.y}
            r={star.r}
            fill="white"
            initial={{ opacity: star.opacity * 0.5 }}
            animate={{ opacity: [star.opacity * 0.3, star.opacity, star.opacity * 0.3] }}
            transition={{ duration: 3 + star.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        <AnimatePresence mode="wait">
        {!hasActiveData ? (
          <motion.g
            key="ghost-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
          >
            {ghostConnections.map((gc, i) => {
              const fn = ghostNodes[gc.from];
              const tn = ghostNodes[gc.to];
              const mixColor = fn.color;
              return (
                <g key={`ghost-conn-${i}`}>
                  <motion.line
                    x1={fn.x} y1={fn.y} x2={tn.x} y2={tn.y}
                    stroke={mixColor}
                    strokeWidth={0.8}
                    strokeOpacity={0.06}
                    strokeDasharray="4,10"
                    animate={{ strokeOpacity: [0.03, 0.08, 0.03] }}
                    transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
                  />
                  {[0, 1].map(pi => {
                    const dur = 3 + i * 0.4;
                    const delay = pi * (dur / 2) + i * 0.6;
                    return (
                      <motion.circle
                        key={`ghost-pulse-${i}-${pi}`}
                        r={1.5}
                        fill={mixColor}
                        className="pointer-events-none"
                        animate={{
                          cx: [fn.x, tn.x],
                          cy: [fn.y, tn.y],
                          opacity: [0, 0.5, 0.5, 0],
                        }}
                        transition={{
                          duration: dur,
                          delay,
                          repeat: Infinity,
                          ease: "linear",
                          times: [0, 0.15, 0.85, 1],
                        }}
                      />
                    );
                  })}
                </g>
              );
            })}

            {ghostParticles.map((p, i) => (
              <motion.circle
                key={`ghost-micro-${i}`}
                r={p.r}
                fill={p.color}
                className="pointer-events-none"
                animate={{
                  cx: [p.x, p.x + p.dx, p.x - p.dx * 0.5, p.x],
                  cy: [p.y, p.y + p.dy, p.y - p.dy * 0.3, p.y],
                  opacity: [0, p.opacity, p.opacity * 0.6, 0],
                }}
                transition={{
                  duration: p.dur,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}

            {ghostNodes.map((gn, i) => (
              <g key={`ghost-${i}`}>
                <motion.circle
                  cx={gn.x} cy={gn.y} r={35}
                  fill={`url(#pm-ghost-glow-${i})`}
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
                />
                <motion.circle
                  cx={gn.x} cy={gn.y} r={20}
                  fill="none"
                  stroke={gn.color}
                  strokeWidth={0.6}
                  strokeDasharray="4,6"
                  animate={{ opacity: [0.06, 0.18, 0.06], rotate: 360 }}
                  transition={{ opacity: { duration: 3, repeat: Infinity }, rotate: { duration: 20 + i * 5, repeat: Infinity, ease: "linear" } }}
                  style={{ transformOrigin: `${gn.x}px ${gn.y}px` }}
                />
                <motion.circle
                  cx={gn.x} cy={gn.y} r={14}
                  fill="rgba(255,255,255,0.015)"
                  stroke={gn.color}
                  strokeWidth={0.6}
                  strokeOpacity={0.12}
                  animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.95, 1.05, 0.95] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                  style={{ transformOrigin: `${gn.x}px ${gn.y}px` }}
                />
                <motion.text
                  x={gn.x} y={gn.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={gn.color}
                  fontSize="12"
                  fontWeight="300"
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                  className="pointer-events-none select-none"
                >
                  {gn.label}
                </motion.text>
              </g>
            ))}

            <motion.text
              x={centerX} y={centerY - 50}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#21d8ff"
              fontSize="18"
              fontWeight="700"
              letterSpacing="1"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              className="pointer-events-none select-none"
              style={{ textShadow: "0 0 20px rgba(33,216,255,0.6), 0 0 40px rgba(33,216,255,0.3), 0 0 60px rgba(33,216,255,0.15)" }}
            >
              Select peptides to map their pathways
            </motion.text>

            <motion.text
              x={centerX} y={centerY - 28}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(255,255,255,0.6)"
              fontSize="12"
              fontWeight="400"
              letterSpacing="0.3"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 0.75, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              className="pointer-events-none select-none"
            >
              Discover how compounds interact through shared mechanisms
            </motion.text>

            <motion.g
              animate={{ y: [0, 6, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <line
                x1={centerX} y1={centerY + 20}
                x2={centerX} y2={centerY + 60}
                stroke="#22c55e"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              <path
                d={`M${centerX - 12} ${centerY + 50} L${centerX} ${centerY + 66} L${centerX + 12} ${centerY + 50}`}
                fill="none"
                stroke="#22c55e"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx={centerX} cy={centerY + 66}
                r={18}
                fill="none"
                stroke="#22c55e"
                strokeWidth={0}
                opacity={0}
              />
              <motion.circle
                cx={centerX} cy={centerY + 43}
                r={28}
                fill="url(#pm-arrow-glow)"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.g>
          </motion.g>
        ) : (
          <motion.g
            key="active-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {connections.map((conn, ci) => {
              const fn = nodes[conn.from];
              const tn = nodes[conn.to];
              const key = connKey(conn.from, conn.to);
              const isActive = activeConnection === key || activeNode === fn.name || activeNode === tn.name;
              const tierColor = TIER_COLORS[conn.tier];
              const isLegendary = conn.tier === "legendary";
              const isStrong = conn.tier === "strong";
              const isGood = conn.tier === "good";
              const hasTier = isLegendary || isStrong || isGood;

              const fromSlug = peptideData[conn.from]?.slug ?? null;
              const toSlug = peptideData[conn.to]?.slug ?? null;
              const overlapMatch = findOverlapForPair(fromSlug, toSlug, triggeredOverlaps);
              const isOverlap = !!overlapMatch;
              const OVERLAP_AMBER = "#f59e0b";

              const baseW = isLegendary ? 3 : isStrong ? 2.5 : isGood ? 2 : 1 + (conn.strength / maxStrength) * 2;
              const particleCount = isLegendary ? 6 : isStrong ? 4 : Math.max(2, Math.min(5, conn.strength));
              const rawMidX = (fn.x + tn.x) / 2;
              const rawMidY = (fn.y + tn.y) / 2;

              const stackPos = labelPositions[`stack-${ci}`];
              const synergyPos = labelPositions[`synergy-${ci}`];
              const reasonPos = labelPositions[`reason-${ci}`];

              return (
                <g key={key} data-testid={isOverlap ? `overlap-line-${overlapMatch!.cluster.receptorKey}-${conn.from}-${conn.to}` : undefined}>
                  {isLegendary && !isOverlap && (
                    <motion.line
                      x1={fn.x} y1={fn.y} x2={tn.x} y2={tn.y}
                      stroke={conn.stackColor || tierColor}
                      strokeWidth={baseW + 12}
                      strokeLinecap="round"
                      strokeOpacity={0.08}
                      filter="url(#pm-glow-legendary)"
                      animate={{ strokeOpacity: [0.05, 0.12, 0.05] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}

                  <motion.line
                    x1={fn.x} y1={fn.y} x2={tn.x} y2={tn.y}
                    stroke={isOverlap ? OVERLAP_AMBER : (hasTier ? tierColor : `url(#pm-grad-${conn.from}-${conn.to})`)}
                    strokeWidth={isOverlap ? (isActive ? 2.5 : 2) : (isActive ? baseW + 2 : baseW)}
                    strokeLinecap="round"
                    strokeOpacity={isOverlap ? (isActive ? 0.85 : 0.6) : (isLegendary ? 0.85 : isStrong ? 0.6 : isGood ? 0.4 : (isActive ? 0.9 : 0.25))}
                    strokeDasharray={isOverlap ? "6,5" : (isGood ? "8,6" : undefined)}
                    filter={isOverlap ? undefined : (isLegendary ? "url(#pm-glow-legendary)" : (isActive || isStrong) ? "url(#pm-glow-line)" : undefined)}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />

                  {!isOverlap && (isActive || isLegendary) && (
                    <motion.line
                      x1={fn.x} y1={fn.y} x2={tn.x} y2={tn.y}
                      stroke={hasTier ? tierColor : `url(#pm-grad-${conn.from}-${conn.to})`}
                      strokeWidth={baseW + 6}
                      strokeLinecap="round"
                      strokeOpacity={isLegendary ? 0.2 : 0.15}
                      filter={isLegendary ? "url(#pm-glow-legendary)" : "url(#pm-glow-line)"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  )}

                  <line
                    x1={fn.x} y1={fn.y} x2={tn.x} y2={tn.y}
                    stroke="transparent"
                    strokeWidth={20}
                    onMouseEnter={() => setHoveredConnection(key)}
                    onMouseLeave={() => setHoveredConnection(null)}
                    onClick={() => handleConnectionClick(key)}
                    className="cursor-pointer"
                  />

                  {isOverlap && isActive && (
                    <g pointerEvents="none">
                      <rect
                        x={rawMidX - 78}
                        y={rawMidY - 22}
                        width={156}
                        height={16}
                        rx={4}
                        fill="rgba(20,16,8,0.92)"
                        stroke="rgba(245,158,11,0.45)"
                        strokeWidth={0.8}
                      />
                      <text
                        x={rawMidX}
                        y={rawMidY - 11}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#fbbf24"
                        fontSize="8"
                        fontWeight="600"
                        letterSpacing="0.5"
                      >
                        Shared {overlapMatch!.cluster.receptor.split(/\s+/).slice(0, 3).join(" ")} — see card
                      </text>
                    </g>
                  )}

                  {!isOverlap && Array.from({ length: particleCount }).map((_, pi) => {
                    const dur = isLegendary ? 2.5 : 3;
                    const delay = pi * (dur / particleCount);
                    const pColor = isLegendary ? (conn.stackColor || tierColor) : isStrong ? tierColor : tierColor || fn.color;
                    const pRadius = isLegendary ? 2.5 : isActive ? 3 : 1.5;
                    const peakOpacity = isLegendary ? 0.9 : (isActive ? 0.9 : 0.4);
                    return (
                      <motion.circle
                        key={`particle-${key}-${pi}`}
                        r={pRadius}
                        fill={pColor}
                        filter={isLegendary || isActive ? "url(#pm-glow-soft)" : undefined}
                        className="pointer-events-none"
                        animate={{
                          cx: [fn.x, fn.x, tn.x, tn.x],
                          cy: [fn.y, fn.y, tn.y, tn.y],
                          opacity: [0, peakOpacity, peakOpacity, 0],
                        }}
                        transition={{
                          duration: dur,
                          delay,
                          repeat: Infinity,
                          ease: "linear",
                          times: [0, 0.1, 0.9, 1],
                        }}
                      />
                    );
                  })}

                  {conn.stackName && stackPos && (
                    <g>
                      <motion.line
                        x1={rawMidX} y1={rawMidY} x2={stackPos.x} y2={stackPos.y}
                        stroke={isLegendary ? "rgba(251,191,36,0.15)" : "rgba(107,114,128,0.1)"}
                        strokeWidth={0.5}
                        strokeDasharray="3,4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: Math.abs(stackPos.y - rawMidY) > 5 ? 0.6 : 0 }}
                        transition={{ delay: 0.5 }}
                      />
                      <motion.rect
                        x={stackPos.x - (conn.stackName.length * 3 + 10)}
                        y={stackPos.y - 8}
                        width={(conn.stackName.length * 6 + 20)}
                        height={16}
                        rx={8}
                        fill={isLegendary ? "rgba(30,25,10,0.85)" : isStrong ? "rgba(10,25,30,0.8)" : "rgba(20,20,25,0.75)"}
                        stroke={isLegendary ? "rgba(251,191,36,0.5)" : isStrong ? "rgba(33,216,255,0.35)" : "rgba(107,114,128,0.3)"}
                        strokeWidth={0.8}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                      />
                      <motion.text
                        x={stackPos.x}
                        y={stackPos.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={isLegendary ? "url(#pm-holo-gold)" : isStrong ? "url(#pm-holo-cyan)" : "url(#pm-holo-gray)"}
                        fontSize="7"
                        fontWeight="600"
                        letterSpacing="0.8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.85 }}
                        transition={{ delay: 0.7 }}
                        className="pointer-events-none select-none uppercase"
                        style={{ filter: isLegendary ? "drop-shadow(0 0 4px rgba(251,191,36,0.4))" : isStrong ? "drop-shadow(0 0 3px rgba(33,216,255,0.3))" : undefined }}
                      >
                        {conn.stackName}
                      </motion.text>
                    </g>
                  )}

                  {!conn.stackName && conn.reason && (isActive || isLegendary) && reasonPos && (
                    <motion.text
                      x={reasonPos.x}
                      y={reasonPos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={tierColor}
                      fontSize="9"
                      fontWeight="500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.7 }}
                      transition={{ delay: 0.5 }}
                      className="pointer-events-none select-none"
                    >
                      {conn.reason.length > 50 ? conn.reason.slice(0, 48) + "…" : conn.reason}
                    </motion.text>
                  )}

                  {conn.synergyScore > 0 && synergyPos && (
                    <motion.text
                      x={synergyPos.x}
                      y={synergyPos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isLegendary ? "#fbbf24" : isStrong ? "#21d8ff" : "#9ca3af"}
                      fontSize="7"
                      fontWeight="500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isLegendary ? 0.85 : 0.55 }}
                      transition={{ delay: 0.8 }}
                      className="pointer-events-none select-none"
                      style={isLegendary ? { filter: "drop-shadow(0 0 3px rgba(251,191,36,0.3))" } : undefined}
                    >
                      {conn.synergyScore}% synergy
                    </motion.text>
                  )}
                </g>
              );
            })}

            {allPathwayNodes.map((pn, i) => {
              const parentKey = connKey(pn.fromNode, pn.toNode);
              const isActive = activeConnection === parentKey || activeNode === nodes[pn.fromNode].name || activeNode === nodes[pn.toNode].name;
              const midX = (nodes[pn.fromNode].x + nodes[pn.toNode].x) / 2;
              const midY = (nodes[pn.fromNode].y + nodes[pn.toNode].y) / 2;
              const labelW = Math.min(90, pn.name.length * 7 + 16);

              return (
                <g key={`pw-${i}`}>
                  <motion.line
                    x1={midX} y1={midY} x2={pn.x} y2={pn.y}
                    stroke="#22c55e"
                    strokeWidth={0.5}
                    strokeDasharray="3,3"
                    strokeOpacity={isActive ? 0.6 : 0.15}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                  />
                  <motion.rect
                    x={pn.x - labelW / 2}
                    y={pn.y - 10}
                    width={labelW}
                    height={20}
                    rx={10}
                    fill={isActive ? "rgba(34,197,94,0.2)" : "rgba(34,197,94,0.06)"}
                    stroke={isActive ? "rgba(34,197,94,0.6)" : "rgba(34,197,94,0.15)"}
                    strokeWidth={isActive ? 1 : 0.5}
                    filter={isActive ? "url(#pm-glow-soft)" : undefined}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.08, type: "spring", stiffness: 200 }}
                    onMouseEnter={() => setHoveredConnection(parentKey)}
                    onMouseLeave={() => setHoveredConnection(null)}
                    onClick={() => handleConnectionClick(parentKey)}
                    className="cursor-pointer"
                  />
                  <motion.text
                    x={pn.x}
                    y={pn.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isActive ? "#4ade80" : "#22c55e"}
                    fontSize="9"
                    fontWeight={isActive ? "700" : "500"}
                    letterSpacing="0.3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isActive ? 1 : 0.7 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    className="pointer-events-none select-none"
                    style={isActive ? { filter: "drop-shadow(0 0 4px rgba(34,197,94,0.6))" } : undefined}
                  >
                    {pn.name.length > 16 ? pn.name.slice(0, 14) + "…" : pn.name}
                  </motion.text>
                </g>
              );
            })}

            {nodes.map((node, i) => {
              const isActive = activeNode === node.name;
              const nodeR = isActive ? 32 : 26;

              return (
                <g
                  key={`node-${i}`}
                  onMouseEnter={() => setHoveredNode(node.name)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => handleNodeClick(node.name)}
                  className="cursor-pointer"
                >
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeR + 20}
                    fill={`url(#pm-nglow-${i})`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isActive ? 0.8 : 0.4 }}
                    className="pointer-events-none"
                  />

                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeR + 8}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={0.5}
                    strokeDasharray="4,6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.1, 0.3, 0.1], rotate: 360 }}
                    transition={{ opacity: { duration: 3, repeat: Infinity }, rotate: { duration: 20, repeat: Infinity, ease: "linear" } }}
                    style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                  />

                  {isActive && (
                    <motion.circle
                      cx={node.x}
                      cy={node.y}
                      r={nodeR + 4}
                      fill="none"
                      stroke={node.color}
                      strokeWidth={1.5}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                    />
                  )}

                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    fill={`${node.color}10`}
                    stroke={node.color}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    filter={isActive ? "url(#pm-glow-strong)" : "url(#pm-glow-soft)"}
                    initial={{ r: 0, opacity: 0 }}
                    animate={{ r: nodeR, opacity: 1 }}
                    transition={{ duration: 0.6, delay: i * 0.12, type: "spring", stiffness: 150 }}
                  />

                  {(() => {
                    const displayName = node.name.length > 14 ? node.name.slice(0, 12) + "…" : node.name;
                    const fontSize = node.name.length > 12 ? 9 : node.name.length > 8 ? 10 : 11;
                    const pillW = displayName.length * (fontSize * 0.7) + 16;
                    const pillH = fontSize + 10;
                    return (
                      <>
                        <motion.rect
                          x={node.x - pillW / 2}
                          y={node.y - pillH / 2}
                          width={pillW}
                          height={pillH}
                          rx={pillH / 2}
                          fill="rgba(8,11,16,0.85)"
                          stroke={node.color}
                          strokeWidth={0.5}
                          strokeOpacity={0.3}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.35 + i * 0.12 }}
                          className="pointer-events-none"
                        />
                        <motion.text
                          x={node.x}
                          y={node.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill={isActive ? "#ffffff" : node.color}
                          fontSize={fontSize}
                          fontWeight="700"
                          letterSpacing="0.5"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 + i * 0.12 }}
                          className="pointer-events-none select-none"
                          style={{ 
                            filter: isActive ? `drop-shadow(0 0 8px ${node.color})` : `drop-shadow(0 0 3px ${node.color}80)`,
                          }}
                        >
                          {displayName}
                        </motion.text>
                      </>
                    );
                  })()}
                </g>
              );
            })}
            {soloPathwayLabels.length > 0 && nodes.length === 1 && (
              <>
                {soloPathwayLabels.map((label, li) => {
                  const node = nodes[0];
                  return (
                    <g key={`solo-path-${li}`}>
                      <motion.line
                        x1={node.x} y1={node.y}
                        x2={label.x} y2={label.y}
                        stroke={node.color}
                        strokeWidth={0.8}
                        strokeOpacity={0.3}
                        strokeDasharray="4,6"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 + li * 0.15 }}
                      />
                      <motion.circle
                        cx={label.x} cy={label.y} r={4}
                        fill={node.color}
                        fillOpacity={0.4}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.5 + li * 0.15 }}
                      />
                      <motion.text
                        x={label.x} y={label.y - 12}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="9"
                        fontWeight="500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.8 }}
                        transition={{ duration: 0.5, delay: 0.6 + li * 0.15 }}
                        className="pointer-events-none select-none"
                        style={{ textShadow: `0 0 6px ${node.color}40` }}
                      >
                        {label.name}
                      </motion.text>
                    </g>
                  );
                })}
              </>
            )}
          </motion.g>
        )}
        </AnimatePresence>
      </svg>
      </div>
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ zIndex: 10 }}>
        <AnimatePresence>
          {hasActiveData && activeConnection && (() => {
            const parts = activeConnection.split("-");
            const fromIdx = parseInt(parts[0]);
            const toIdx = parseInt(parts[1]);
            const conn = connections.find(c => c.from === fromIdx && c.to === toIdx);
            if (!conn) return null;
            return (
              <motion.div
                key="conn-info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mx-4 mb-8 p-3 rounded-lg border backdrop-blur-md pointer-events-auto"
                style={{
                  background: "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(13,17,23,0.97))",
                  borderColor: "rgba(34,197,94,0.3)",
                  boxShadow: "0 0 20px rgba(34,197,94,0.1), inset 0 1px 0 rgba(34,197,94,0.1)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-3.5 w-3.5 text-[#22c55e]" style={{ filter: "drop-shadow(0 0 4px rgba(34,197,94,0.5))" }} />
                  <span className="text-xs font-bold text-[#22c55e]" style={{ textShadow: "0 0 8px rgba(34,197,94,0.4)" }}>
                    {nodes[conn.from].name} ↔ {nodes[conn.to].name}
                  </span>
                </div>
                {conn.reason && (
                  <p className="text-[12px] text-gray-300 mb-2 pl-5.5 leading-relaxed" style={{ paddingLeft: "22px" }}>
                    {conn.reason}
                  </p>
                )}
                {conn.pathways.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {conn.pathways.map((p, i) => (
                      <span key={i} className="text-[11px] px-2 py-1 rounded-full bg-[#22c55e]/10 text-[#4ade80] border border-[#22c55e]/20"
                        style={{ textShadow: "0 0 6px rgba(34,197,94,0.3)" }}>
                        {p}{PATHWAY_DESCRIPTIONS[p] ? ` — ${PATHWAY_DESCRIPTIONS[p].slice(0, 60)}` : ""}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })()}

          {hasActiveData && activeNode && !activeConnection && (() => {
            const node = nodes.find(n => n.name === activeNode);
            if (!node) return null;
            const connCount = connections.filter(c => nodes[c.from].name === activeNode || nodes[c.to].name === activeNode).length;
            return (
              <motion.div
                key="node-info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mx-4 mb-8 p-3 rounded-lg border backdrop-blur-md pointer-events-auto"
                style={{
                  background: `linear-gradient(135deg, ${node.color}12, rgba(13,17,23,0.97))`,
                  borderColor: `${node.color}30`,
                  boxShadow: `0 0 20px ${node.color}10, inset 0 1px 0 ${node.color}10`,
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: node.color, boxShadow: `0 0 8px ${node.color}` }} />
                  <span className="text-sm font-bold" style={{ color: node.color, textShadow: `0 0 8px ${node.color}60` }}>
                    {node.name}
                  </span>
                  <span className="text-[11px] text-gray-500 ml-1">
                    {connCount} connection{connCount !== 1 ? "s" : ""} · {node.systems.join(", ")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {node.pathways.map((p, i) => (
                    <span key={i} className="text-[11px] px-2 py-1 rounded-full border"
                      style={{ backgroundColor: `${node.color}10`, color: node.color, borderColor: `${node.color}25` }}>
                      {p}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
        {hasActiveData && !activeNode && !activeConnection && allSharedPathways.length > 0 && (
          <div className="px-4 pb-8 pointer-events-auto">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-gray-500 font-medium text-[14px]">Shared pathways:</span>
              {allSharedPathways.map((pathway, i) => (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <Badge className="text-[13px] bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20 cursor-help pointer-events-auto"
                      style={{ textShadow: "0 0 6px rgba(34,197,94,0.3)" }}>
                      {pathway}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[220px] text-center bg-[#0d1117] border-[#22c55e]/30">
                    <p className="text-xs">{PATHWAY_DESCRIPTIONS[pathway] || "Shared biological pathway"}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="absolute bottom-2 right-3 flex items-center gap-1.5 opacity-70" style={{ zIndex: 11 }}>
        <Zap className="h-3 w-3 text-[#22c55e]" style={{ filter: "drop-shadow(0 0 4px rgba(34,197,94,0.5))" }} />
        <span className="text-[10px] text-[#22c55e]/80 tracking-wide font-medium">
          Powered by Revive Synergy Engine&#8482;
        </span>
      </div>
    </motion.div>
  );
}

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
  const [isPublicStack, setIsPublicStack] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [cartExpanded, setCartExpanded] = useState(false);
  const [showSavedStacks, setShowSavedStacks] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
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
    mutationFn: async (data: { name: string; peptideIds: string[]; peptideNames: string[]; isPublic: boolean; synergyScore: number }): Promise<SavedStack> => {
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
      setIsPublicStack(true);
      if (saved.isPublic && saved.shareCode) {
        navigate(`/stacks/${saved.shareCode}`);
      } else {
        toast({ title: "Stack Saved!", description: "Your stack is saved privately. Manage it from your dashboard." });
        navigate("/dashboard?tab=stacks");
      }
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

  // Restore pending save stack after login redirect
  useEffect(() => {
    if (!isAuthenticated || !products || products.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    if (!params.get('openSave')) return;
    const pending = localStorage.getItem('pending-save-stack');
    if (!pending) return;
    try {
      const ids: string[] = JSON.parse(pending);
      const matched = ids.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];
      if (matched.length >= 2) {
        setSelectedPeptides(matched);
        const systems = getActiveSystems(matched.map(p => p.name));
        const systemLabel = systems.length > 0 ? systems[0].charAt(0).toUpperCase() + systems[0].slice(1) : "Custom";
        setStackName(`${systemLabel} Research Stack`);
        setTimeout(() => setShowSaveDialog(true), 400);
      }
    } catch { /* ignore parse errors */ }
    localStorage.removeItem('pending-save-stack');
    window.history.replaceState({}, '', window.location.pathname);
  }, [isAuthenticated, products]);

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
      <div className="hidden md:block">
        <PathwayMap selectedPeptides={selectedPeptides} />
      </div>

      <div className="md:hidden" data-testid="mobile-synergy-teaser">
        <Card className="border-[#2a2a32] bg-[#1a1a1f]/80 overflow-hidden">
          <div className="relative p-5">
            <div className="absolute inset-0 opacity-[0.07]" style={{
              backgroundImage: `radial-gradient(circle at 30% 40%, #21d8ff 0%, transparent 50%), radial-gradient(circle at 70% 60%, #E7FB10 0%, transparent 50%), radial-gradient(circle at 50% 20%, #a78bfa 0%, transparent 40%)`,
            }} />
            <div className="relative space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-[#22c55e]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-wide">REVIVE Synergy Engine™</h4>
                  <p className="text-[10px] text-white/40">Proprietary Research Tool</p>
                </div>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                See an <span className="text-[#21d8ff]">interactive pathway visualization map</span> — watch animated connections form between your selected peptides, revealing shared biological mechanisms with glowing network nodes and real-time particle effects.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#21d8ff]/10 border border-[#21d8ff]/20">
                  <Monitor className="h-3.5 w-3.5 text-[#21d8ff]" />
                  <span className="text-xs font-semibold text-[#21d8ff]">Desktop Only</span>
                </div>
                <p className="text-[10px] text-white/40">Open on a computer to unlock this feature</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Mobile-only Goal Starters - shown above grid so new users see it first */}
      {selectedPeptides.length === 0 && products && (
        <div className="lg:hidden">
          <Card className="border-[#2a2a32] bg-[#1a1a1f]/50" data-testid="card-goal-starters-mobile">
            <div className="p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-1">NOT SURE WHERE TO START?</p>
              <p className="text-xs text-muted-foreground mb-3">Pick a research goal and we'll suggest the best starting peptide.</p>
              <div className="grid grid-cols-3 gap-2">
                {GOAL_STARTERS.map(starter => {
                  const StarterIcon = starter.icon;
                  const matchingProduct = products.find(p => 
                    normalizePeptideName(p.name).includes(starter.starterKey.replace(/[^a-z0-9]/g, ''))
                  );
                  return (
                    <motion.button
                      key={starter.goal}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        if (matchingProduct) {
                          setSelectedPeptides([matchingProduct]);
                        }
                      }}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-lg border border-[#2a2a32] bg-[#1a1a1f] transition-all text-center hover-elevate active-elevate-2"
                      style={{ borderColor: `${starter.color}30` }}
                      data-testid={`button-goal-mobile-${starter.goal.toLowerCase()}`}
                    >
                      <StarterIcon className="h-4 w-4 shrink-0" style={{ color: starter.color }} />
                      <span className="text-[10px] font-medium leading-tight" style={{ color: starter.color }}>
                        {starter.goal}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      )}
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
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-3">
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
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 overflow-y-auto pr-1 scrollbar-thin max-h-[400px] sm:max-h-[600px]">
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
                        className={`text-left p-2 sm:p-3 rounded-lg border transition-all duration-200 relative ${
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
                            <p className={`font-display font-bold text-sm sm:text-base truncate ${
                              isSelected ? "text-[#21d8ff]" : isOutOfStock ? "text-white/50" : "text-white"
                            }`}>
                              {product.name.replace(/\s*\([^)]*\)/g, '')}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: isOutOfStock ? `${primaryCategory.color}80` : primaryCategory.color }}>
                              {primaryCategory.label}
                            </p>
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
                        {isOutOfStock && (
                          <span className="absolute top-1 right-1 text-[8px] font-bold text-red-400/70 bg-red-950/60 px-1 py-0.5 rounded leading-none">OOS</span>
                        )}
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

        {/* Right Column: Synergy Visualization Panel - hidden on mobile, sticky sidebar on desktop */}
        <div className="hidden lg:block">
          <div className="lg:sticky lg:top-28 space-y-4">
            
            {/* ====== SYNERGY RING & SCORE ====== */}
            {(() => {
              const peptideNames = selectedPeptides.map(p => p.name);
              const synergyScore = calculateSynergyScore(peptideNames);
              const knownStack = checkKnownStack(peptideNames);
              const recommendation = getStackRecommendation(peptideNames);
              const sharedPathways = findSharedPathways(peptideNames);
              const activeSystems = getActiveSystems(peptideNames);
              const pathwayOverlaps = detectPathwayOverlaps(
                selectedPeptides
                  .map((p) => p.slug)
                  .filter((s): s is string => Boolean(s)),
              );
              
              return (
                <>
                  {/* Synergy Ring Visualization */}
                  <Card className={`border-2 bg-gradient-to-br from-[#1a1a1f] to-[#0f0f12] overflow-hidden ${selectedPeptides.length === 0 ? "border-[#a78bfa]/60" : "border-[#9d4edd]/40"}`} style={selectedPeptides.length === 0 ? { boxShadow: "0 0 18px rgba(167,139,250,0.35), 0 0 40px rgba(167,139,250,0.15), inset 0 0 12px rgba(167,139,250,0.08)", animation: "glowPulse 2s ease-in-out infinite" } : undefined} data-testid="card-synergy-ring">
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
                              <p className="font-display font-bold text-xl tracking-wide">PICK A GOAL TO START</p>
                              <p className="text-base text-muted-foreground mt-1">or select any peptide below</p>
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

                          {pathwayOverlaps.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const el = document.getElementById("pathway-overlap-card");
                                if (el) {
                                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                                  window.dispatchEvent(new CustomEvent("pathway-overlap-highlight"));
                                }
                              }}
                              className="mt-2 inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 hover-elevate active-elevate-2"
                              data-testid="chip-overlap-cue"
                            >
                              <span>
                                {pathwayOverlaps.length} receptor overlap{pathwayOverlaps.length > 1 ? "s" : ""}
                              </span>
                              <ChevronDown className="h-3 w-3" />
                            </button>
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
                  {/* ====== PATHWAY OVERLAP DETECTION ====== */}
                  {pathwayOverlaps.length > 0 && (
                    <PathwayOverlapCard overlaps={pathwayOverlaps} />
                  )}
                  {/* ====== GOAL-BASED STARTERS (empty state, desktop only - mobile version is above grid) ====== */}
                  {selectedPeptides.length === 0 && products && (
                    <Card className="hidden lg:block border-[#2a2a32] bg-[#1a1a1f]/50" data-testid="card-goal-starters">
                      <div className="p-4">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">NOT SURE WHERE TO START?</p>
                        <p className="text-xs text-muted-foreground mb-3">Pick a research goal and we'll suggest the best starting peptide.</p>
                        <div className="grid grid-cols-2 gap-2">
                          {GOAL_STARTERS.map(starter => {
                            const StarterIcon = starter.icon;
                            const matchingProduct = products.find(p => 
                              normalizePeptideName(p.name).includes(starter.starterKey.replace(/[^a-z0-9]/g, ''))
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
                          const missingNorm = m.replace(/[^a-z0-9]/g, '');
                          return generalPairings.some(p => p.stackHint && p.partner.replace(/[^a-z0-9]/g, '') === missingNorm);
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
                    if (selectedPeptides.length >= 2) autoOpen.push("pathways");

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
                                      normalizePeptideName(p.name).includes(pairing.partner.replace(/[^a-z0-9]/g, ''))
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
                                  {savedStacks.slice(0, 5).map((stack) => {
                                    const stackProductSlugs = (stack.peptideIds || [])
                                      .map((id) => products?.find((p) => p.id === id)?.slug ?? null)
                                      .filter((s): s is string => Boolean(s));
                                    const stackOverlaps = detectPathwayOverlaps(stackProductSlugs);
                                    return (
                                    <div 
                                      key={stack.id}
                                      className="flex items-center justify-between p-2 rounded-lg bg-[#0f0f12] border border-[#2a2a32] hover:border-[#21d8ff]/40 transition-colors"
                                      data-testid={`saved-stack-item-${stack.id}`}
                                    >
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <p className="font-medium text-sm truncate">{stack.name}</p>
                                          {stackOverlaps.length > 0 && (
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <span
                                                  className="inline-flex items-center gap-0.5 shrink-0 px-1 py-0.5 rounded text-[9px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                                  data-testid={`badge-saved-stack-overlap-${stack.id}`}
                                                >
                                                  <GitMerge className="h-2.5 w-2.5" />
                                                  <span>
                                                    {stackOverlaps.length} overlap{stackOverlaps.length > 1 ? "s" : ""}
                                                  </span>
                                                </span>
                                              </TooltipTrigger>
                                              <TooltipContent
                                                side="top"
                                                className="max-w-[260px] bg-[#1a1a1f] border-[#2a2a32]"
                                              >
                                                <p className="text-[11px] font-semibold text-amber-200 mb-1">
                                                  Pathway overlap detected
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                  Selected compounds engage the same receptor system: {stackOverlaps.map((o) => o.cluster.receptor).join(", ")}.
                                                </p>
                                              </TooltipContent>
                                            </Tooltip>
                                          )}
                                        </div>
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
                                    );
                                  })}
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
                                  {popularStacks.slice(0, 3).map((combo, i) => {
                                    const comboOverlaps = detectPathwayOverlaps(combo.peptideNames);
                                    return (
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
                                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                        <p className="text-xs text-muted-foreground truncate">
                                          {combo.peptideNames.join(' + ')}
                                        </p>
                                        {comboOverlaps.length > 0 && (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <span
                                                className="inline-flex items-center gap-0.5 shrink-0 px-1 py-0.5 rounded text-[9px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                                data-testid={`badge-popular-combo-overlap-${i}`}
                                              >
                                                <GitMerge className="h-2.5 w-2.5" />
                                                <span>{comboOverlaps.length} overlap{comboOverlaps.length > 1 ? "s" : ""}</span>
                                              </span>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-[260px] bg-[#1a1a1f] border-[#2a2a32]">
                                              <p className="text-[11px] font-semibold text-amber-200 mb-1">Pathway overlap detected</p>
                                              <p className="text-[11px] text-muted-foreground">
                                                Selected compounds engage the same receptor system: {comboOverlaps.map((o) => o.cluster.receptor).join(", ")}.
                                              </p>
                                            </TooltipContent>
                                          </Tooltip>
                                        )}
                                      </div>
                                      <Badge variant="outline" className="text-[10px] ml-2 shrink-0">
                                        {combo.count}x built
                                      </Badge>
                                    </div>
                                    );
                                  })}
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
      {/* ====== MOBILE FLOATING SYNERGY BAR ====== */}
      <AnimatePresence>
        {selectedPeptides.length >= 2 && !cartExpanded && (() => {
          const peptideNames = selectedPeptides.map(p => p.name);
          const synergyScore = calculateSynergyScore(peptideNames);
          const knownStack = checkKnownStack(peptideNames);
          const synergyColor = knownStack ? knownStack.color : synergyScore > 70 ? "#22c55e" : synergyScore > 50 ? "#E7FB10" : "#21d8ff";
          const sharedPathways = findSharedPathways(peptideNames);
          return (
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="lg:hidden fixed bottom-[120px] md:bottom-[56px] left-2 right-2 z-[52] rounded-xl border bg-[#0f0f12]/95 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)]"
              style={{ borderColor: `${synergyColor}40` }}
              data-testid="mobile-synergy-bar"
            >
              <div className="flex items-center gap-3 px-3 py-2">
                {/* Mini Synergy Ring */}
                <div className="relative w-11 h-11 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#2a2a32" strokeWidth="8" />
                    <motion.circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke={synergyColor}
                      strokeWidth="8"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 264" }}
                      animate={{ strokeDasharray: `${(synergyScore / 100) * 264} 264` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      style={{ filter: `drop-shadow(0 0 4px ${synergyColor}80)` }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span
                      key={synergyScore}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="font-display text-sm font-bold"
                      style={{ color: synergyColor }}
                    >
                      {synergyScore}%
                    </motion.span>
                  </div>
                </div>

                {/* Stack Info */}
                <div className="flex-1 min-w-0">
                  {knownStack ? (
                    <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                      <p className="font-display font-bold text-sm truncate" style={{ color: knownStack.color }}>
                        {knownStack.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{knownStack.description?.slice(0, 60)}...</p>
                    </motion.div>
                  ) : (
                    <div>
                      <p className="font-display font-bold text-sm text-white">
                        {sharedPathways.length > 0 ? `${sharedPathways.length} Shared Pathway${sharedPathways.length > 1 ? 's' : ''}` : "Custom Stack"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {sharedPathways.length > 0 ? sharedPathways.slice(0, 2).join(', ') : "Select more for higher synergy"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Synergy label */}
                <Badge 
                  className="shrink-0 text-[10px] no-default-hover-elevate no-default-active-elevate"
                  style={{ 
                    backgroundColor: `${synergyColor}15`,
                    color: synergyColor,
                    border: `1px solid ${synergyColor}40`
                  }}
                >
                  {synergyScore >= 85 ? "Legendary" : synergyScore >= 70 ? "Strong" : "Building"}
                </Badge>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
      {/* Spacer for sticky bottom bar + mobile synergy bar + mobile nav */}
      <div className={`${selectedPeptides.length >= 2 ? "h-52" : "h-36"} md:h-20`} />
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
              {selectedPeptides.length >= 2 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isAuthenticated) {
                      localStorage.setItem('pending-save-stack', JSON.stringify(selectedPeptides.map(p => p.id)));
                      login('/research-stacks?openSave=true');
                      return;
                    }
                    const systems = getActiveSystems(selectedPeptides.map(p => p.name));
                    const systemLabel = systems.length > 0
                      ? systems[0].charAt(0).toUpperCase() + systems[0].slice(1)
                      : "Custom";
                    if (!stackName) setStackName(`${systemLabel} Research Stack`);
                    setCartExpanded(true);
                    setShowSaveDialog(true);
                  }}
                  className="border-[#21d8ff]/40 text-[#21d8ff] text-xs sm:text-sm"
                  data-testid="button-save-stack"
                >
                  <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Save Stack</span>
                  <span className="sm:hidden">Save</span>
                </Button>
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
                          const mobilePathwayOverlaps = detectPathwayOverlaps(
                            selectedPeptides
                              .map((p) => p.slug)
                              .filter((s): s is string => Boolean(s)),
                          );
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
                              {mobilePathwayOverlaps.length > 0 && (
                                <div className="pt-1" data-testid="mobile-pathway-overlap-wrapper">
                                  <PathwayOverlapCard overlaps={mobilePathwayOverlaps} />
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {selectedPeptides.length >= 2 && (
                          <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-[#2a2a32]">
                            <div className="flex gap-2">
                              <Dialog open={showSaveDialog} onOpenChange={(open) => {
                                  setShowSaveDialog(open);
                                  if (open && !stackName) {
                                    const systems = getActiveSystems(selectedPeptides.map(p => p.name));
                                    const systemLabel = systems.length > 0
                                      ? systems[0].charAt(0).toUpperCase() + systems[0].slice(1)
                                      : "Custom";
                                    setStackName(`${systemLabel} Research Stack`);
                                  }
                                }}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="border-[#21d8ff]/40 text-[#21d8ff] hover:bg-[#21d8ff]/10"
                                    onClick={() => {
                                      if (!isAuthenticated) {
                                        localStorage.setItem('pending-save-stack', JSON.stringify(selectedPeptides.map(p => p.id)));
                                        login('/research-stacks?openSave=true');
                                        return;
                                      }
                                      setShowSaveDialog(true);
                                    }}
                                    data-testid="button-save-stack-expanded"
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
                                    <div className="flex items-center justify-between rounded-lg border border-[#2a2a32] bg-[#0f0f12] px-4 py-3">
                                      <div>
                                        <p className="text-sm font-medium text-white">Public link</p>
                                        <p className="text-xs text-muted-foreground">Anyone with the link can view this stack</p>
                                      </div>
                                      <button
                                        type="button"
                                        role="switch"
                                        aria-checked={isPublicStack}
                                        onClick={() => setIsPublicStack(v => !v)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isPublicStack ? "bg-[#21d8ff]" : "bg-[#2a2a32]"}`}
                                        data-testid="toggle-is-public"
                                      >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublicStack ? "translate-x-6" : "translate-x-1"}`} />
                                      </button>
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
                                          peptideNames: selectedPeptides.map(p => p.name.replace(/\s*\([^)]*\)/g, '').trim()),
                                          isPublic: isPublicStack,
                                          synergyScore: calculateSynergyScore(selectedPeptides.map(p => p.name)),
                                        });
                                      }}
                                      disabled={saveStackMutation.isPending}
                                      className="w-full bg-[#21d8ff] text-black hover:bg-[#21d8ff]/90"
                                      data-testid="button-confirm-save"
                                    >
                                      {saveStackMutation.isPending ? "Saving..." : "Save & View Share Page"}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              <div className="relative">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="border-[#2a2a32]"
                                  onClick={() => setShowShareMenu(!showShareMenu)}
                                  data-testid="button-quick-share"
                                >
                                  <Share2 className="h-4 w-4" />
                                </Button>
                                {showShareMenu && (() => {
                                  const names = selectedPeptides.map(p => p.name).join(', ');
                                  const stackText = `Check out my REVIVE research stack: ${names}`;
                                  const stackUrl = window.location.href;
                                  const encodedText = encodeURIComponent(stackText);
                                  const encodedUrl = encodeURIComponent(stackUrl);
                                  return (
                                    <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={() => setShowShareMenu(false)} data-testid="share-menu-overlay">
                                      <div className="absolute inset-0 bg-black/60" />
                                      <div
                                        className="relative z-10 w-56 rounded-md border border-[#2a2a32] bg-[#1a1a1f] shadow-2xl overflow-hidden"
                                        onClick={(e) => e.stopPropagation()}
                                        data-testid="share-menu-dropdown"
                                      >
                                        <div className="px-3 py-2 border-b border-[#2a2a32]">
                                          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Share Stack</p>
                                        </div>
                                        <button
                                          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-white/80 hover-elevate text-left"
                                          onClick={() => {
                                            navigator.clipboard.writeText(`${stackText}\n${stackUrl}`);
                                            toast({ title: "Copied to clipboard!" });
                                            setShowShareMenu(false);
                                          }}
                                          data-testid="share-copy-link"
                                        >
                                          <Copy className="h-4 w-4 text-[#21d8ff]" />
                                          Copy Link
                                        </button>
                                        <button
                                          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-white/80 hover-elevate text-left"
                                          onClick={() => {
                                            window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank', 'noopener');
                                            setShowShareMenu(false);
                                          }}
                                          data-testid="share-twitter"
                                        >
                                          <X className="h-4 w-4 text-white" />
                                          Share on X
                                        </button>
                                        <button
                                          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-white/80 hover-elevate text-left"
                                          onClick={() => {
                                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, '_blank', 'noopener');
                                            setShowShareMenu(false);
                                          }}
                                          data-testid="share-facebook"
                                        >
                                          <svg className="h-4 w-4 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                          Facebook
                                        </button>
                                        <button
                                          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-white/80 hover-elevate text-left"
                                          onClick={() => {
                                            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank', 'noopener');
                                            setShowShareMenu(false);
                                          }}
                                          data-testid="share-linkedin"
                                        >
                                          <svg className="h-4 w-4 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                          LinkedIn
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
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

  const { data: productsWithStock } = useQuery<any[]>({
    queryKey: ["/api/products-with-stock"],
  });

  const priceLookup = useMemo(() => {
    if (!productsWithStock) return new Map<string, number>();
    return buildPriceLookup(productsWithStock);
  }, [productsWithStock]);

  const getStackPricing = (stackId: string) => {
    return calculateStackPricing(stackId, priceLookup);
  };

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
            const prebuiltOverlaps = detectPathwayOverlaps(stack.peptides);

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

                    <div className="flex flex-wrap gap-1.5 items-center">
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
                      {prebuiltOverlaps.length > 0 && (
                        stack.intentionalOverlap ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                className="inline-flex items-center gap-0.5 shrink-0 px-1 py-0.5 rounded text-[9px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30"
                                data-testid={`badge-prebuilt-overlap-${stack.id}`}
                              >
                                <GitMerge className="h-2.5 w-2.5" />
                                <span>Receptor competition</span>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[260px] bg-[#1a1a1f] border-[#2a2a32]">
                              <p className="text-[11px] font-semibold text-sky-300 mb-1">Receptor competition study</p>
                              <p className="text-[11px] text-muted-foreground">
                                Shared receptor occupancy ({prebuiltOverlaps.map((o) => o.cluster.receptor).join(", ")}) is the intended research design — not an accidental overlap.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                className="inline-flex items-center gap-0.5 shrink-0 px-1 py-0.5 rounded text-[9px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                data-testid={`badge-prebuilt-overlap-${stack.id}`}
                              >
                                <GitMerge className="h-2.5 w-2.5" />
                                <span>{prebuiltOverlaps.length} overlap{prebuiltOverlaps.length > 1 ? "s" : ""}</span>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[260px] bg-[#1a1a1f] border-[#2a2a32]">
                              <p className="text-[11px] font-semibold text-amber-200 mb-1">Pathway overlap detected</p>
                              <p className="text-[11px] text-muted-foreground">
                                Selected compounds engage the same receptor system: {prebuiltOverlaps.map((o) => o.cluster.receptor).join(", ")}.
                              </p>
                              <a
                                href={`/research-stacks/${stack.id}#pathway-overlap`}
                                className="inline-block mt-1.5 text-[11px] text-amber-300 hover:text-amber-200 underline underline-offset-2"
                                data-testid={`link-overlap-details-${stack.id}`}
                              >
                                View details
                              </a>
                            </TooltipContent>
                          </Tooltip>
                        )
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {stack.description}
                    </p>

                    <div className="rounded-md bg-white/[0.04] border border-white/[0.07] px-3 py-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Zap className="h-3 w-3 shrink-0" style={{ color: stack.color }} />
                        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: stack.color }}>
                          Why it works
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2" data-testid={`text-synergy-teaser-${stack.id}`}>
                        {stack.synergy.beginner}
                      </p>
                    </div>

                    <div className="flex items-end justify-between pt-2 border-t border-[#2a2a32]">
                      <div className="space-y-1">
                        {(() => {
                          const pricing = getStackPricing(stack.id);
                          if (!pricing) return <Skeleton className="h-12 w-32" />;
                          return (
                            <>
                              <div className="text-xs text-muted-foreground">
                                If bought separately: <span className="line-through">${pricing.retailValue.toFixed(2)}</span>
                              </div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold" style={{ color: stack.color }}>
                                  ${pricing.stackPrice.toFixed(2)}
                                </span>
                                <span className="text-xs text-green-500 font-medium">
                                  Save ${pricing.savings.toFixed(2)}
                                </span>
                              </div>
                            </>
                          );
                        })()}
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

