import { db } from "./db";
import { products, coas } from "@shared/schema";

const sampleProducts = [
  {
    name: "BPC-157",
    description: "BPC-157 is a synthetic peptide consisting of 15 amino acids. It is a partial sequence of body protection compound (BPC) found in human gastric juice. This research compound has been extensively studied for its potential regenerative properties in laboratory settings.",
    shortDescription: "15 amino acid synthetic peptide for research applications",
    price: "49.99",
    originalPrice: "59.99",
    category: "Peptides",
    inStock: true,
    featured: true,
    benefits: [
      "High purity research grade compound",
      "Third-party tested for quality assurance",
      "Includes Certificate of Authenticity",
      "Lyophilized powder form for stability"
    ],
    usage: "For laboratory research use only. Store at -20°C. Reconstitute with bacteriostatic water before use.",
    imageUrl: null,
  },
  {
    name: "TB-500",
    description: "TB-500 is a synthetic version of the naturally occurring peptide Thymosin Beta-4. This research compound consists of 43 amino acids and has been the subject of numerous scientific studies examining cellular processes and tissue regeneration mechanisms.",
    shortDescription: "43 amino acid research peptide compound",
    price: "54.99",
    originalPrice: "64.99",
    category: "Peptides",
    inStock: true,
    featured: true,
    benefits: [
      "Research grade purity >99%",
      "Comprehensive lab testing documentation",
      "COA included with every order",
      "Stable lyophilized formulation"
    ],
    usage: "For laboratory research purposes only. Store frozen at -20°C. Handle according to standard peptide protocols.",
    imageUrl: null,
  },
  {
    name: "GHK-Cu",
    description: "GHK-Cu is a copper peptide complex consisting of the tripeptide glycyl-L-histidyl-L-lysine bound to copper. This research compound has been extensively studied for its role in various biological processes and cellular signaling pathways.",
    shortDescription: "Copper tripeptide complex for research",
    price: "39.99",
    originalPrice: null,
    category: "Peptides",
    inStock: true,
    featured: true,
    benefits: [
      "High-purity copper peptide complex",
      "Verified by independent laboratory testing",
      "Certificate of Authenticity provided",
      "Research-ready formulation"
    ],
    usage: "For research applications only. Store in cool, dry conditions. Follow standard laboratory handling procedures.",
    imageUrl: null,
  },
  {
    name: "Epithalon",
    description: "Epithalon is a synthetic tetrapeptide (Ala-Glu-Asp-Gly) that has been studied in research settings for its potential effects on telomerase activity. This research compound is provided in high-purity lyophilized form.",
    shortDescription: "Tetrapeptide for telomerase research",
    price: "44.99",
    originalPrice: "54.99",
    category: "Peptides",
    inStock: true,
    featured: false,
    benefits: [
      "Synthetic tetrapeptide compound",
      ">98% purity verified",
      "Third-party lab tested",
      "Complete documentation included"
    ],
    usage: "For laboratory research only. Store at recommended temperature. Handle with appropriate precautions.",
    imageUrl: null,
  },
  {
    name: "Ipamorelin",
    description: "Ipamorelin is a synthetic pentapeptide that has been studied for its selective growth hormone releasing properties in research settings. This compound consists of 5 amino acids and is provided in research-grade purity.",
    shortDescription: "Pentapeptide growth hormone research compound",
    price: "59.99",
    originalPrice: null,
    category: "Peptides",
    inStock: true,
    featured: false,
    benefits: [
      "Selective pentapeptide compound",
      "Research-grade purity standards",
      "Full COA documentation",
      "Lyophilized for stability"
    ],
    usage: "For research purposes only. Maintain proper storage conditions. Follow standard peptide handling protocols.",
    imageUrl: null,
  },
  {
    name: "Semax",
    description: "Semax is a synthetic peptide derived from ACTH (adrenocorticotropic hormone). This heptapeptide has been the subject of research examining cognitive and neurological processes in laboratory settings.",
    shortDescription: "ACTH-derived heptapeptide for neuroscience research",
    price: "64.99",
    originalPrice: "74.99",
    category: "Peptides",
    inStock: false,
    featured: false,
    benefits: [
      "Synthetic heptapeptide compound",
      "High analytical purity",
      "Comprehensive testing documentation",
      "Suitable for neuroscience research"
    ],
    usage: "For laboratory research applications. Store frozen. Handle according to established protocols.",
    imageUrl: null,
  },
];

async function seed() {
  console.log("Starting database seed...");

  const existingProducts = await db.select().from(products);
  if (existingProducts.length > 0) {
    console.log("Database already has products, skipping seed.");
    return;
  }

  console.log("Inserting products...");
  const insertedProducts = await db.insert(products).values(sampleProducts).returning();
  console.log(`Inserted ${insertedProducts.length} products`);

  const sampleCoas = [
    {
      batchNumber: "RVR-2024-001",
      productId: insertedProducts[0].id,
      productName: "BPC-157",
      testDate: "November 15, 2024",
      expirationDate: "November 15, 2026",
      purity: "99.2%",
      labName: "Analytical Labs International",
      verified: true,
      results: [
        "HPLC Purity|≥98%|99.2%|pass",
        "Mass Spectrometry|1419.53 Da|1419.51 Da|pass",
        "Peptide Content|≥95%|97.8%|pass",
        "Endotoxin|<0.5 EU/mg|<0.1 EU/mg|pass",
        "Sterility|Negative|Negative|pass"
      ],
    },
    {
      batchNumber: "RVR-2024-002",
      productId: insertedProducts[1].id,
      productName: "TB-500",
      testDate: "November 10, 2024",
      expirationDate: "November 10, 2026",
      purity: "99.5%",
      labName: "Analytical Labs International",
      verified: true,
      results: [
        "HPLC Purity|≥98%|99.5%|pass",
        "Mass Spectrometry|4963.44 Da|4963.42 Da|pass",
        "Peptide Content|≥95%|98.2%|pass",
        "Endotoxin|<0.5 EU/mg|<0.1 EU/mg|pass",
        "Sterility|Negative|Negative|pass"
      ],
    },
    {
      batchNumber: "RVR-2024-003",
      productId: insertedProducts[2].id,
      productName: "GHK-Cu",
      testDate: "November 5, 2024",
      expirationDate: "November 5, 2026",
      purity: "98.7%",
      labName: "Analytical Labs International",
      verified: true,
      results: [
        "HPLC Purity|≥98%|98.7%|pass",
        "Copper Content|9-11%|10.2%|pass",
        "Peptide Content|≥95%|96.5%|pass",
        "Heavy Metals|<10 ppm|<5 ppm|pass",
        "Sterility|Negative|Negative|pass"
      ],
    },
  ];

  console.log("Inserting COAs...");
  const insertedCoas = await db.insert(coas).values(sampleCoas).returning();
  console.log(`Inserted ${insertedCoas.length} COAs`);

  console.log("Seed completed successfully!");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
