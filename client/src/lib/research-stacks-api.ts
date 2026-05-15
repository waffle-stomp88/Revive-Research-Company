export interface ResearchStackApiResponse {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  longDescription: string | null;
  peptideIds: string[];
  peptideDetails: { name: string; description: string }[];
  keyBenefits: string[];
  researchApplications: string[];
  synergyCopy: { beginner: string; expert: string };
  storageGuide: string;
  educationLinks: { articleUrl: string; peptideName: string; articleTitle: string }[];
  iconName: string;
  color: string;
  badge: string | null;
  badgeColor: string | null;
  category: string;
  synergyBonus: number;
  detailPageId: string | null;
  showOnPage: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}
