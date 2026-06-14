import { FREE_SHIPPING_THRESHOLD } from "./constants";

export const SITE_NAME = "Revive Research Company";

export interface RouteMeta {
  title: string;
  description: string;
}

export const ROUTE_META: Record<string, RouteMeta> = {
  "/": {
    title: `Research Peptides & COA-Verified Compounds | ${SITE_NAME}`,
    description: "Premium research compounds with third-party COA verification. Engineered with intention, built for those who don't wait for permission.",
  },
  "/shop": {
    title: `Shop All Research Compounds | ${SITE_NAME}`,
    description: "Browse our complete collection of premium research peptides and compounds. Third-party tested with Certificates of Analysis available for every batch.",
  },
  "/peptides": {
    title: `Research Peptides | ${SITE_NAME}`,
    description: `Shop premium research peptides with third-party COA verification. BPC-157, TB-500, GHK-Cu, Ipamorelin, and more. Free shipping on orders over $${FREE_SHIPPING_THRESHOLD}.`,
  },
  "/research-stacks": {
    title: `Research Stacks & Custom Bundles | ${SITE_NAME}`,
    description: "Build custom research peptide stacks with real-time synergy analysis. Pre-built stacks like Wolverine Stack (BPC-157 + TB-500) with up to 20% savings.",
  },
  "/bulk-packs": {
    title: `Bulk Research Packs | ${SITE_NAME}`,
    description: "Save on bulk research compound purchases. Volume discounts on premium peptides with full COA documentation.",
  },
  "/cart": {
    title: `Shopping Cart | ${SITE_NAME}`,
    description: `Review your research compound order. Free shipping on orders over $${FREE_SHIPPING_THRESHOLD}.`,
  },
  "/checkout": {
    title: `Checkout | ${SITE_NAME}`,
    description: "Complete your research compound order securely.",
  },
  "/contact": {
    title: `Contact Us | ${SITE_NAME}`,
    description: "Get in touch with Revive Research. Questions about our research compounds, COAs, or orders? We're here to help.",
  },
  "/affiliate": {
    title: `Affiliate Program | ${SITE_NAME}`,
    description: "Join the Revive Research affiliate program. Earn 10% commission on referrals with a 30-day cookie window. $100 minimum payout.",
  },
  "/terms-of-service": {
    title: `Terms of Service | ${SITE_NAME}`,
    description: "Read the Revive Research terms of service. Understand our policies on research compound sales, shipping, and returns.",
  },
  "/privacy": {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: "Revive Research privacy policy. Learn how we protect your data and personal information.",
  },
  "/disclaimer": {
    title: `Disclaimer | ${SITE_NAME}`,
    description: "Important legal disclaimers about Revive Research products. All compounds are for research use only.",
  },
  "/legal": {
    title: `Legal Information | ${SITE_NAME}`,
    description: "Legal information and compliance details for Revive Research products and services.",
  },
  "/coa/verify-certificate-of-analysis": {
    title: `Verify Certificate of Analysis (COA) | ${SITE_NAME}`,
    description: "Verify the authenticity of your research compound Certificate of Analysis. Enter your batch number to view third-party lab testing results.",
  },
  "/coa/batch-testing-archive": {
    title: `Batch Testing Archive | ${SITE_NAME}`,
    description: "Browse our complete archive of third-party batch testing results. Every batch of research compounds tested for purity and identity.",
  },
  "/tools/peptide-reconstitution-calculator": {
    title: `Peptide Reconstitution Calculator | ${SITE_NAME}`,
    description: "Free peptide reconstitution calculator. Calculate precise dilution volumes for your research peptides based on vial size and desired concentration.",
  },
  "/reconstitution-wizard": {
    title: `Reconstitution Wizard - Step-by-Step Peptide Guide | ${SITE_NAME}`,
    description: "Guided peptide reconstitution wizard with animated syringe visualization. Get exact draw-to-mark instructions and download a printable Vial Card.",
  },
  "/peptide-research-faq": {
    title: `Peptide Research FAQ | ${SITE_NAME}`,
    description: "Frequently asked questions about research peptides, ordering, shipping, COAs, and more. Get answers from Revive Research.",
  },
  "/peptide-shipping-and-handling": {
    title: `Shipping & Handling | ${SITE_NAME}`,
    description: `Free shipping on orders over $${FREE_SHIPPING_THRESHOLD}. Learn about our shipping methods, delivery times, and handling procedures for research compounds.`,
  },
  "/peptide-research-resources": {
    title: `Peptide Research Resources | ${SITE_NAME}`,
    description: "Educational resources for peptide researchers. Guides, tools, and reference materials for your research needs.",
  },
  "/about/our-transparency-commitment": {
    title: `Our Transparency Commitment | ${SITE_NAME}`,
    description: "Learn about Revive Research's commitment to transparency in research compound sourcing, testing, and pricing.",
  },
  "/academy": {
    title: `Peptide Academy | ${SITE_NAME}`,
    description: "Learn the science of peptides through our gamified Peptide Academy. 4 modules, 17 lessons, and XP-based rewards.",
  },
  "/guides/peptide-education-center": {
    title: `Peptide Education Center | ${SITE_NAME}`,
    description: "Comprehensive peptide education hub. Learn about mechanisms of action, research applications, and proper handling of research compounds.",
  },
  "/guides/peptide-quality-assurance-process": {
    title: `Quality Assurance Process | ${SITE_NAME}`,
    description: "Our rigorous quality assurance process for research compounds. Third-party testing, GMP certification, and COA verification.",
  },
  "/guides/peptide-vendor-ethics-standards": {
    title: `Vendor Ethics & Standards | ${SITE_NAME}`,
    description: "Our ethical standards for research compound sales. What we do and don't do as a responsible peptide vendor.",
  },
  "/guides/peptide-pricing-breakdown": {
    title: `Peptide Pricing Breakdown | ${SITE_NAME}`,
    description: "Transparent pricing for research compounds. See exactly what goes into the cost of high-quality, third-party tested peptides.",
  },
  "/guides/peptide-vendor-checklist": {
    title: `Peptide Vendor Checklist | ${SITE_NAME}`,
    description: "How to evaluate peptide vendors. A buyer's checklist for ensuring quality, authenticity, and compliance in research compound purchases.",
  },
  "/guides/peptide-handling-troubleshooting": {
    title: `Peptide Handling & Troubleshooting | ${SITE_NAME}`,
    description: "Troubleshooting guide for research peptides. Storage, reconstitution, and handling best practices.",
  },
  "/guides/peptide-lab-research-archive": {
    title: `Lab Research Archive | ${SITE_NAME}`,
    description: "Browse our archive of lab notes and research findings. Ongoing documentation of peptide research and quality testing.",
  },
  "/guides/peptide-package-arrived-warm": {
    title: `Package Arrived Warm? Here's What to Know | ${SITE_NAME}`,
    description: "Worried about your peptide package arriving warm? Learn why lyophilized peptides are shelf-stable and how temperature affects research compounds.",
  },
  "/guides/are-peptide-coas-trustworthy": {
    title: `Are Peptide COAs Trustworthy? | ${SITE_NAME}`,
    description: "How to evaluate the trustworthiness of Certificates of Analysis. What to look for in third-party peptide testing documentation.",
  },
  "/guides/how-batch-testing-works": {
    title: `How Batch Testing Works | ${SITE_NAME}`,
    description: "Understand the batch testing process for research peptides. HPLC, mass spectrometry, and purity analysis explained.",
  },
  "/guides/what-research-use-only-means": {
    title: `What "Research Use Only" Actually Means | ${SITE_NAME}`,
    description: "Understanding the Research Use Only (RUO) designation for peptides. Legal framework, compliance requirements, and what it means for researchers.",
  },
  "/guides/how-to-verify-peptide-quality": {
    title: `How to Verify Peptide Quality | ${SITE_NAME}`,
    description: "Verify research peptide quality with third-party lab testing. Learn how to read Colmaric Analyticals COA reports, interpret mass spec results, and spot vendor red flags.",
  },
  "/guides/peptide-purity-explained": {
    title: `What Peptide Purity Percentages Mean | ${SITE_NAME}`,
    description: "Understanding peptide purity percentages. What 95%, 98%, and 99%+ purity means for your research and how HPLC testing works.",
  },
  "/guides/why-cheap-peptides-are-cheap": {
    title: `Why Cheap Peptides Are Cheap | ${SITE_NAME}`,
    description: "The hidden costs of cheap research peptides. Why quality, purity, and proper testing matter more than price.",
  },
};
