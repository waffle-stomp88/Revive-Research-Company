export interface CompoundProfile {
  slug: string;
  fullName: string;
  formula: string;
  molecularWeight: string;
  casNumber: string;
  sequence?: string;
  aminoAcids?: number;
}

const compoundProfiles: CompoundProfile[] = [
  {
    slug: "bpc-157",
    fullName: "Body Protection Compound-157",
    formula: "C\u2086\u2082H\u2089\u2088N\u2081\u2086O\u2082\u2082",
    molecularWeight: "1419.55 Da",
    casNumber: "137525-51-0",
    sequence: "Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val",
    aminoAcids: 15,
  },
];

export function getCompoundProfile(slug: string): CompoundProfile | undefined {
  return compoundProfiles.find((p) => p.slug === slug);
}
