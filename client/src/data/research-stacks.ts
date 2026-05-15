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
