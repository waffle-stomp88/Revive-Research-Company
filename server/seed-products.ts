import { db } from "./db";
import { products } from "@shared/schema";
import { eq } from "drizzle-orm";

const newProducts = [
  {
    name: "Tesamorelin",
    description: "Tesamorelin is a synthetic growth hormone-releasing hormone (GHRH) analog. It stimulates the pituitary gland to produce and release growth hormone, particularly targeting visceral adipose tissue reduction. This peptide has been extensively studied for its effects on body composition and metabolic parameters. Each vial contains pharmaceutical-grade Tesamorelin with verified purity levels exceeding 99%.",
    shortDescription: "GHRH analog for growth hormone stimulation and body composition research",
    price: "189.99",
    originalPrice: "219.99",
    category: "Peptides",
    inStock: true,
    featured: true,
    benefits: [
      "Stimulates natural growth hormone release",
      "Targets visceral adipose tissue",
      "Supports metabolic research",
      "High bioavailability",
      "Third-party verified purity >99%"
    ],
    usage: "For research purposes only. Reconstitute with bacteriostatic water. Store refrigerated after reconstitution. Typical research protocols use 1-2mg daily."
  },
  {
    name: "Retatrutide",
    description: "Retatrutide is a novel triple-agonist peptide targeting GLP-1, GIP, and glucagon receptors simultaneously. This innovative compound represents the next generation of incretin-based research molecules. Studies have shown remarkable effects on metabolic parameters and energy homeostasis. Our Retatrutide is synthesized using advanced peptide manufacturing techniques with rigorous quality control.",
    shortDescription: "Triple-agonist peptide targeting GLP-1, GIP, and glucagon receptors",
    price: "249.99",
    originalPrice: "299.99",
    category: "Peptides",
    inStock: true,
    featured: true,
    benefits: [
      "Triple receptor agonist mechanism",
      "Advanced metabolic research compound",
      "Targets multiple incretin pathways",
      "Novel research applications",
      "Certificate of Analysis included"
    ],
    usage: "For research purposes only. Handle with appropriate laboratory precautions. Store at -20°C for long-term stability. Reconstitute immediately before use."
  },
  {
    name: "Tirzepatide",
    description: "Tirzepatide is a dual GIP and GLP-1 receptor agonist peptide designed for advanced metabolic research. This compound combines the benefits of glucose-dependent insulinotropic polypeptide (GIP) and glucagon-like peptide-1 (GLP-1) receptor activation. Extensively studied in clinical settings, Tirzepatide offers researchers a powerful tool for investigating metabolic pathways.",
    shortDescription: "Dual GIP/GLP-1 receptor agonist for metabolic research",
    price: "224.99",
    originalPrice: "274.99",
    category: "Peptides",
    inStock: true,
    featured: true,
    benefits: [
      "Dual receptor activation",
      "Enhanced glucose regulation research",
      "Appetite and satiety studies",
      "Metabolic pathway investigation",
      "Pharmaceutical-grade quality"
    ],
    usage: "For research purposes only. Reconstitute with sterile water. Store at 2-8°C. Use within 30 days of reconstitution for optimal stability."
  },
  {
    name: "Semaglutide",
    description: "Semaglutide is a glucagon-like peptide-1 (GLP-1) receptor agonist with extended half-life properties. This peptide has been extensively researched for its effects on glucose metabolism, appetite regulation, and cardiovascular parameters. Our Semaglutide is manufactured to the highest pharmaceutical standards with comprehensive quality documentation.",
    shortDescription: "Long-acting GLP-1 receptor agonist for metabolic research",
    price: "199.99",
    originalPrice: "249.99",
    category: "Peptides",
    inStock: true,
    featured: false,
    benefits: [
      "Extended half-life formulation",
      "GLP-1 receptor research",
      "Glucose metabolism studies",
      "Cardiovascular research applications",
      "Verified purity and potency"
    ],
    usage: "For research purposes only. Store refrigerated at 2-8°C. Protect from light. Weekly dosing protocols commonly used in research settings."
  },
  {
    name: "GLOW Peptide Complex",
    description: "GLOW is our premium peptide complex formulated for skin and cellular regeneration research. This unique blend combines multiple bioactive peptides known for their effects on collagen synthesis, cellular turnover, and tissue repair mechanisms. Ideal for dermatological and anti-aging research applications.",
    shortDescription: "Premium peptide complex for skin regeneration and cellular research",
    price: "159.99",
    originalPrice: "189.99",
    category: "Peptides",
    inStock: true,
    featured: false,
    benefits: [
      "Multi-peptide formulation",
      "Collagen synthesis research",
      "Cellular regeneration studies",
      "Dermatological applications",
      "Synergistic peptide blend"
    ],
    usage: "For research purposes only. Contains multiple active peptides. Store at 2-8°C. Reconstitute according to specific research protocol requirements."
  },
  {
    name: "NAD+ Precursor",
    description: "NAD+ (Nicotinamide Adenine Dinucleotide) is a critical coenzyme found in every cell, essential for cellular energy production and numerous metabolic processes. Our NAD+ precursor compound is designed for research into cellular aging, mitochondrial function, and metabolic health. This high-purity formulation supports advanced longevity and bioenergetics research.",
    shortDescription: "High-purity NAD+ precursor for cellular energy and longevity research",
    price: "134.99",
    originalPrice: "164.99",
    category: "Research Compounds",
    inStock: true,
    featured: false,
    benefits: [
      "Supports cellular energy research",
      "Mitochondrial function studies",
      "Longevity and aging research",
      "DNA repair mechanism investigation",
      "High bioavailability formulation"
    ],
    usage: "For research purposes only. Store in a cool, dry place away from light. Suitable for various in vitro and in vivo research applications."
  },
  {
    name: "CJC-1295",
    description: "CJC-1295 is a synthetic analog of growth hormone-releasing hormone (GHRH) with extended half-life due to Drug Affinity Complex (DAC) technology. This modification allows for sustained growth hormone release over extended periods. Widely used in endocrine and metabolic research, CJC-1295 offers researchers a valuable tool for studying the GH/IGF-1 axis.",
    shortDescription: "Long-acting GHRH analog with DAC technology for GH research",
    price: "174.99",
    originalPrice: "209.99",
    category: "Peptides",
    inStock: true,
    featured: false,
    benefits: [
      "Extended half-life formulation",
      "Sustained GH release research",
      "DAC technology for stability",
      "GH/IGF-1 axis investigation",
      "Purity verified >98%"
    ],
    usage: "For research purposes only. Reconstitute with bacteriostatic water. Store at 2-8°C after reconstitution. Typical research protocols use 1-2mg weekly."
  }
];

async function seedProducts() {
  console.log("Seeding new products...");
  
  for (const product of newProducts) {
    try {
      const [existing] = await db.select().from(products).where(eq(products.name, product.name));
      
      if (existing) {
        console.log(`Product "${product.name}" already exists, skipping...`);
        continue;
      }
      
      await db.insert(products).values(product);
      console.log(`Added product: ${product.name}`);
    } catch (error) {
      console.error(`Error adding ${product.name}:`, error);
    }
  }
  
  console.log("Product seeding complete!");
}

seedProducts()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
