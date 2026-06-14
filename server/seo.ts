import { storage } from "./storage";
import { db } from "./db";
import { savedStacks } from "@shared/schema";
import { eq } from "drizzle-orm";
import { FREE_SHIPPING_THRESHOLD } from "@shared/constants";
import { ROUTE_META, SITE_NAME as SHARED_SITE_NAME } from "@shared/seo-meta";

const SITE_NAME = SHARED_SITE_NAME;
const SITE_URL = "https://reviveresearch.co";
const DEFAULT_IMAGE = `${SITE_URL}/assets/logo.png`;
const DEFAULT_DESCRIPTION = "Premium research compounds. Third-party tested, COA verified. Engineered with intention, built for those who don't wait for permission.";

interface PageMeta {
  title: string;
  description: string;
  ogType?: string;
  ogImage?: string;
  canonicalUrl?: string;
  jsonLd?: object[];
  noindex?: boolean;
}

const THIN_PRODUCT_SLUGS = new Set([
  'botulinum-toxin-type-a',
  'pnc-27',
  'hyaluronic-acid',
  'ara-290',
  'cjc-1295-no-dac',
  'cjc-1295-ipamorelin-stack',
  'adipotide',
  'ghrp-6',
  'hexarelin',
  'vip',
  'igf-des',
  'l-carnitine',
  'b12-injection',
]);

function makeBreadcrumbList(items: Array<{name: string; url: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map(({name, url}, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": name,
      "item": url
    }))
  };
}

const STATIC_ROUTES: Record<string, PageMeta> = {
  "/": {
    title: ROUTE_META["/"].title,
    description: ROUTE_META["/"].description,
    ogType: "website",
    jsonLd: [{
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Revive Research",
      "url": SITE_URL,
      "logo": DEFAULT_IMAGE,
      "description": DEFAULT_DESCRIPTION,
      "sameAs": []
    }, {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Revive Research",
      "url": SITE_URL,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${SITE_URL}/peptides?search={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    }]
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
    jsonLd: [{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What are research peptides?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Research peptides are short chains of amino acids synthesized in a laboratory setting and sold exclusively for scientific study. They are used by researchers to investigate biological processes such as tissue repair, metabolic regulation, and cellular signaling. All products sold by Revive Research are intended strictly for in-vitro and laboratory research purposes, not for human or animal consumption."
          }
        },
        {
          "@type": "Question",
          "name": "Are research peptides legal to purchase?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "In the United States, research peptides that are not approved pharmaceutical drugs may be legally purchased for laboratory and scientific research purposes. They are not approved by the FDA for human use and must not be used as drugs, dietary supplements, or for any clinical application. It is the buyer's responsibility to understand and comply with the laws in their jurisdiction before ordering."
          }
        },
        {
          "@type": "Question",
          "name": "How do I verify the purity of research peptides?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Every batch produced by Revive Research is sent to an independent, accredited third-party laboratory for purity and identity testing. You can verify any batch by entering the batch number on our Certificate of Analysis verification page. We publish full HPLC and mass spectrometry data for every lot, giving researchers complete transparency into what they are receiving."
          }
        },
        {
          "@type": "Question",
          "name": "What is a Certificate of Analysis (COA)?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A Certificate of Analysis (COA) is an official document issued by an independent laboratory that confirms the identity, purity, and concentration of a compound. Revive Research provides a COA for every batch of every product, verified by third-party labs using HPLC chromatography and mass spectrometry. Researchers can access and verify COAs directly on our website to ensure the compounds meet their study requirements."
          }
        },
        {
          "@type": "Question",
          "name": "How should research peptides be stored?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Lyophilized (freeze-dried) research peptides should be stored in a cool, dry place away from light — typically at -20°C for long-term storage or 2–8°C for short-term use. Once reconstituted with bacteriostatic water, peptide solutions should be refrigerated at 2–8°C and used within 4 weeks for best stability. Always follow the specific storage recommendations provided on the product's COA or label."
          }
        },
        {
          "@type": "Question",
          "name": "What does 'research use only' mean?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "'Research use only' (RUO) means that the compound is intended solely for controlled scientific experimentation and is not approved, intended, or labeled for use in humans or animals. Purchasing an RUO compound implies the buyer is a qualified researcher or institution conducting legitimate laboratory research. These compounds have not undergone the clinical trials required for FDA drug approval."
          }
        },
        {
          "@type": "Question",
          "name": "How do I reconstitute research peptides?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Reconstitution is the process of dissolving a lyophilized peptide powder in a sterile liquid, most commonly bacteriostatic water. The required volume depends on the vial size and your target concentration. Revive Research offers a free Reconstitution Wizard that walks researchers through the calculation step by step and generates a printable Vial Card with the exact draw-to-mark instructions for a given syringe type."
          }
        },
        {
          "@type": "Question",
          "name": "What is the difference between research peptides and pharmaceutical peptides?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Pharmaceutical peptides are FDA-approved drugs manufactured under strict GMP (Good Manufacturing Practice) guidelines, prescribed by physicians, and dispensed through licensed pharmacies. Research peptides are synthesized for laboratory investigation, are not FDA-approved for any medical use, and are sold without a prescription exclusively for scientific study. While both may share the same amino acid sequences, regulatory status, intended use, and quality controls differ significantly."
          }
        },
        {
          "@type": "Question",
          "name": "How are Revive Research peptides tested for quality?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Each batch goes through a multi-step quality process: synthesis by a GMP-compliant manufacturer, followed by independent third-party testing using HPLC for purity and mass spectrometry for identity confirmation. Results must meet a minimum purity threshold before the batch is released for sale. The full COA for every batch is published on our website and can be verified using the batch number printed on the product label."
          }
        },
        {
          "@type": "Question",
          "name": "Do research peptides expire?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Lyophilized peptides are generally stable for 24 months or longer when stored correctly at -20°C and kept away from moisture and light. Once reconstituted into solution, stability decreases and peptides should be used within 4 weeks when refrigerated. Each product label and COA includes a specific expiry date based on the batch's stability testing. Using peptides past their expiry date may compromise research results."
          }
        }
      ]
    }]
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
    jsonLd: [{
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Are Peptide COAs Trustworthy?",
      "author": { "@type": "Organization", "name": "Revive Research" },
      "publisher": { "@type": "Organization", "name": "Revive Research", "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } },
      "datePublished": "2025-12-01"
    }]
  },
  "/guides/how-batch-testing-works": {
    title: `How Batch Testing Works | ${SITE_NAME}`,
    description: "Understand the batch testing process for research peptides. HPLC, mass spectrometry, and purity analysis explained.",
    jsonLd: [{
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "How Batch Testing Works",
      "author": { "@type": "Organization", "name": "Revive Research" },
      "publisher": { "@type": "Organization", "name": "Revive Research", "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } },
      "datePublished": "2025-12-01"
    }]
  },
  "/guides/what-research-use-only-means": {
    title: `What "Research Use Only" Actually Means | ${SITE_NAME}`,
    description: "Understanding the Research Use Only (RUO) designation for peptides. Legal framework, compliance requirements, and what it means for researchers.",
    jsonLd: [{
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "What Research Use Only Actually Means",
      "author": { "@type": "Organization", "name": "Revive Research" },
      "publisher": { "@type": "Organization", "name": "Revive Research", "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } },
      "datePublished": "2025-12-01"
    }]
  },
  "/guides/how-to-verify-peptide-quality": {
    title: `How to Verify Peptide Quality | ${SITE_NAME}`,
    description: "Verify research peptide quality with third-party lab testing. Learn how to read Colmaric Analyticals COA reports, interpret mass spec results, and spot vendor red flags.",
    jsonLd: [{
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "How to Verify Peptide Quality",
      "author": { "@type": "Organization", "name": "Revive Research" },
      "publisher": { "@type": "Organization", "name": "Revive Research", "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } },
      "datePublished": "2025-12-01"
    }]
  },
  "/guides/peptide-purity-explained": {
    title: `What Peptide Purity Percentages Mean | ${SITE_NAME}`,
    description: "Understanding peptide purity percentages. What 95%, 98%, and 99%+ purity means for your research and how HPLC testing works.",
    jsonLd: [{
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "What Peptide Purity Percentages Mean",
      "author": { "@type": "Organization", "name": "Revive Research" },
      "publisher": { "@type": "Organization", "name": "Revive Research", "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } },
      "datePublished": "2025-12-01"
    }]
  },
  "/guides/why-cheap-peptides-are-cheap": {
    title: `Why Cheap Peptides Are Cheap | ${SITE_NAME}`,
    description: "The hidden costs of cheap research peptides. Why quality, purity, and proper testing matter more than price.",
    jsonLd: [{
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Why Cheap Peptides Are Cheap",
      "author": { "@type": "Organization", "name": "Revive Research" },
      "publisher": { "@type": "Organization", "name": "Revive Research", "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE } },
      "datePublished": "2025-12-01"
    }]
  },
};

async function getProductMeta(slug: string): Promise<PageMeta | null> {
  try {
    const product = await storage.getProductBySlugWithDisplayPrice(slug);
    if (!product) return null;

    const price = parseFloat(product.displayPrice) || 0;
    const originalPrice = product.displayOriginalPrice ? parseFloat(product.displayOriginalPrice) : null;
    const displayPriceStr = price > 0 ? `$${price.toFixed(2)}` : '';

    const description = product.description
      ? product.description.replace(/<[^>]*>/g, '').slice(0, 160)
      : `${product.name} - Premium research compound. ${displayPriceStr}. Third-party tested with COA. For research use only.`;

    return {
      title: `${product.name} | ${SITE_NAME}`,
      description,
      ogType: "product",
      ogImage: product.imageUrl || DEFAULT_IMAGE,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "description": description,
          "image": product.imageUrl || DEFAULT_IMAGE,
          "brand": { "@type": "Brand", "name": "Revive Research" },
          "offers": {
            "@type": "Offer",
            "price": price.toFixed(2),
            "priceCurrency": "USD",
            "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": { "@type": "Organization", "name": "Revive Research" }
          }
        },
        makeBreadcrumbList([
          { name: "Home", url: SITE_URL },
          { name: "Research Peptides", url: `${SITE_URL}/peptides` },
          { name: product.name, url: `${SITE_URL}/peptides/${slug}` }
        ])
      ]
    };
  } catch (err) {
    console.error(`[SEO] Error getting product meta for slug "${slug}":`, err);
    return null;
  }
}

async function getArticleMeta(slug: string): Promise<PageMeta | null> {
  try {
    const article = await storage.getEducationArticleBySlug(slug);
    if (!article) return null;

    return {
      title: `${article.title} | ${SITE_NAME}`,
      description: article.summary || article.title,
      ogType: "article",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": article.title,
          "description": article.summary || article.title,
          "author": { "@type": "Organization", "name": "Revive Research" },
          "publisher": {
            "@type": "Organization",
            "name": "Revive Research",
            "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE }
          },
          "datePublished": article.createdAt ? new Date(article.createdAt).toISOString().split('T')[0] : "2025-12-01",
          "dateModified": article.updatedAt ? new Date(article.updatedAt).toISOString().split('T')[0] : undefined
        },
        makeBreadcrumbList([
          { name: "Home", url: SITE_URL },
          { name: "Guides", url: `${SITE_URL}/guides/peptide-education-center` },
          { name: article.title, url: `${SITE_URL}/guides/${slug}` }
        ])
      ]
    };
  } catch (err) {
    console.error(`[SEO] Error getting article meta for slug "${slug}":`, err);
    return null;
  }
}

export async function shouldReturn404(url: string): Promise<boolean> {
  const cleanUrl = url.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';

  if (STATIC_ROUTES[cleanUrl]) return false;

  const productMatch = cleanUrl.match(/^\/(peptides|products)\/(.+)$/);
  if (productMatch) {
    try {
      const product = await storage.getProductBySlugWithDisplayPrice(productMatch[2]);
      if (!product) return true;
    } catch (err) {
      console.error(`[SEO] Error checking product existence for slug "${productMatch[2]}":`, err);
      return false;
    }
    return false;
  }

  const articleMatch = cleanUrl.match(/^\/guides\/(.+)$/);
  if (articleMatch) {
    try {
      const article = await storage.getEducationArticleBySlug(articleMatch[1]);
      if (!article) return true;
    } catch (err) {
      console.error(`[SEO] Error checking article existence for slug "${articleMatch[1]}":`, err);
      return false;
    }
    return false;
  }

  return false;
}

export async function getMetaForUrl(url: string): Promise<PageMeta> {
  const cleanUrl = url.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';

  if (STATIC_ROUTES[cleanUrl]) {
    const route = STATIC_ROUTES[cleanUrl];
    const meta: PageMeta = { ...route, canonicalUrl: `${SITE_URL}${cleanUrl}` };
    if (cleanUrl.startsWith('/guides/')) {
      const leafTitle = route.title.replace(` | ${SITE_NAME}`, '');
      const breadcrumb = makeBreadcrumbList([
        { name: "Home", url: SITE_URL },
        { name: "Guides", url: `${SITE_URL}/guides/peptide-education-center` },
        { name: leafTitle, url: `${SITE_URL}${cleanUrl}` }
      ]);
      meta.jsonLd = [...(route.jsonLd || []), breadcrumb];
    }
    return meta;
  }

  const productMatch = cleanUrl.match(/^\/(peptides|products)\/(.+)$/);
  if (productMatch) {
    const meta = await getProductMeta(productMatch[2]);
    if (meta) {
      const isNoindex = THIN_PRODUCT_SLUGS.has(productMatch[2]);
      return { ...meta, canonicalUrl: `${SITE_URL}/peptides/${productMatch[2]}`, ...(isNoindex ? { noindex: true } : {}) };
    }
  }

  const articleMatch = cleanUrl.match(/^\/guides\/(.+)$/);
  if (articleMatch) {
    const meta = await getArticleMeta(articleMatch[1]);
    if (meta) return { ...meta, canonicalUrl: `${SITE_URL}${cleanUrl}` };
  }

  const stackMatch = cleanUrl.match(/^\/stacks\/([A-Za-z0-9]{6,12})$/);
  if (stackMatch) {
    const shareCode = stackMatch[1];
    try {
      const [stack] = await db.select().from(savedStacks).where(eq(savedStacks.shareCode, shareCode));
      if (stack && stack.isPublic) {
        const sanitizeName = (n: string) => n.replace(/\s*\([^)]*\)/g, '').trim();
        const sanitizedNames = stack.peptideNames.map(sanitizeName);
        const peptideCount = sanitizedNames.length;
        const nameList = sanitizedNames.join(", ");
        const title = `${stack.name} — Research Stack | Revive Research`;
        const synergyScore = stack.synergyScore ?? 0;
        const description = `${peptideCount}-compound research stack with ${synergyScore}% synergy score: ${nameList}. Explore receptor pathway data at Revive Research.`;
        return {
          title,
          description,
          ogType: "article",
          ogImage: `${SITE_URL}/api/stack-preview/${shareCode}.png`,
          canonicalUrl: `${SITE_URL}/stacks/${shareCode}`,
        };
      }
    } catch (err) {
      console.error(`[SEO] Error fetching stack for shareCode "${shareCode}":`, err);
    }
  }

  return {
    title: `${SITE_NAME}`,
    description: DEFAULT_DESCRIPTION,
    canonicalUrl: `${SITE_URL}${cleanUrl}`,
  };
}

export async function getPreRenderedContent(url: string): Promise<string> {
  const cleanUrl = url.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';

  const productMatch = cleanUrl.match(/^\/(peptides|products)\/(.+)$/);
  if (productMatch) {
    try {
      const product = await storage.getProductBySlugWithDisplayPrice(productMatch[2]);
      if (product) {
        const price = parseFloat(product.displayPrice) || 0;
        const priceStr = price > 0 ? `$${price.toFixed(2)}` : '';
        const desc = product.description ? product.description.replace(/<[^>]*>/g, '').slice(0, 500) : '';
        const benefits = product.benefits && Array.isArray(product.benefits)
          ? product.benefits.map((b: string) => `<li>${escapeHtml(b)}</li>`).join('')
          : '';
        const availability = product.inStock ? 'In Stock' : 'Out of Stock';
        const dosages = product.dosageOptions && Array.isArray(product.dosageOptions)
          ? product.dosageOptions.join(', ')
          : '';

        return `<article itemscope itemtype="https://schema.org/Product">
  <header>
    <h1 itemprop="name">${escapeHtml(product.name)}</h1>
    <p>${escapeHtml(product.category || 'Research Compound')} — ${escapeHtml(availability)}</p>
  </header>
  <section>
    <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
      <span itemprop="price" content="${price.toFixed(2)}">${priceStr}</span>
      <meta itemprop="priceCurrency" content="USD" />
      <link itemprop="availability" href="${product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'}" />
    </div>
    ${dosages ? `<p>Available dosages: ${escapeHtml(dosages)}</p>` : ''}
  </section>
  <section itemprop="description">
    <h2>Product Description</h2>
    <p>${escapeHtml(desc)}</p>
  </section>
  ${benefits ? `<section><h2>Key Research Areas</h2><ul>${benefits}</ul></section>` : ''}
  <section>
    <h2>Quality Assurance</h2>
    <p>All ${escapeHtml(product.name)} batches are third-party tested with Certificates of Analysis available for verification.</p>
    <p>For research use only. Not for human consumption.</p>
  </section>
  <footer>
    <p itemprop="brand" itemscope itemtype="https://schema.org/Brand"><span itemprop="name">Revive Research</span></p>
    <nav><a href="/peptides">Browse All Products</a> | <a href="/coa/verify-certificate-of-analysis">Verify COA</a> | <a href="/contact">Contact Us</a></nav>
  </footer>
</article>`;
      }
    } catch (err) {
      console.error(`[SEO] Error pre-rendering product for slug "${productMatch[2]}":`, err);
    }
  }

  const articleMatch = cleanUrl.match(/^\/guides\/(.+)$/);
  if (articleMatch) {
    try {
      const article = await storage.getEducationArticleBySlug(articleMatch[1]);
      if (article) {
        const contentPreview = article.content
          ? article.content.replace(/^#+ .*/gm, '').replace(/[*_`~\[\]]/g, '').trim().slice(0, 3000)
          : '';

        return `<article itemscope itemtype="https://schema.org/Article">
  <header>
    <h1 itemprop="headline">${escapeHtml(article.title)}</h1>
    ${article.summary ? `<p itemprop="description">${escapeHtml(article.summary)}</p>` : ''}
    <span itemprop="author" itemscope itemtype="https://schema.org/Organization"><meta itemprop="name" content="Revive Research" /></span>
  </header>
  <section itemprop="articleBody">
    <p>${escapeHtml(contentPreview)}</p>
  </section>
  <footer>
    <nav><a href="/guides/peptide-education-center">Education Center</a> | <a href="/peptides">Shop Products</a> | <a href="/">Home</a></nav>
    <p>For research use only. Not for human consumption.</p>
  </footer>
</article>`;
      }
    } catch (err) {
      console.error(`[SEO] Error pre-rendering article for slug "${articleMatch[1]}":`, err);
    }
  }

  if (cleanUrl === '/peptide-research-faq') {
    const faqs = [
      {
        q: "What are research peptides?",
        a: "Research peptides are short chains of amino acids synthesized in a laboratory setting and sold exclusively for scientific study. They are used by researchers to investigate biological processes such as tissue repair, metabolic regulation, and cellular signaling. All products sold by Revive Research are intended strictly for in-vitro and laboratory research purposes, not for human or animal consumption."
      },
      {
        q: "Are research peptides legal to purchase?",
        a: "In the United States, research peptides that are not approved pharmaceutical drugs may be legally purchased for laboratory and scientific research purposes. They are not approved by the FDA for human use and must not be used as drugs, dietary supplements, or for any clinical application. It is the buyer's responsibility to understand and comply with the laws in their jurisdiction before ordering."
      },
      {
        q: "How do I verify the purity of research peptides?",
        a: "Every batch produced by Revive Research is sent to an independent, accredited third-party laboratory for purity and identity testing. You can verify any batch by entering the batch number on our Certificate of Analysis verification page. We publish full HPLC and mass spectrometry data for every lot, giving researchers complete transparency into what they are receiving."
      },
      {
        q: "What is a Certificate of Analysis (COA)?",
        a: "A Certificate of Analysis (COA) is an official document issued by an independent laboratory that confirms the identity, purity, and concentration of a compound. Revive Research provides a COA for every batch of every product, verified by third-party labs using HPLC chromatography and mass spectrometry. Researchers can access and verify COAs directly on our website to ensure the compounds meet their study requirements."
      },
      {
        q: "How should research peptides be stored?",
        a: "Lyophilized (freeze-dried) research peptides should be stored in a cool, dry place away from light — typically at -20°C for long-term storage or 2–8°C for short-term use. Once reconstituted with bacteriostatic water, peptide solutions should be refrigerated at 2–8°C and used within 4 weeks for best stability. Always follow the specific storage recommendations provided on the product's COA or label."
      },
      {
        q: "What does 'research use only' mean?",
        a: "'Research use only' (RUO) means that the compound is intended solely for controlled scientific experimentation and is not approved, intended, or labeled for use in humans or animals. Purchasing an RUO compound implies the buyer is a qualified researcher or institution conducting legitimate laboratory research. These compounds have not undergone the clinical trials required for FDA drug approval."
      },
      {
        q: "How do I reconstitute research peptides?",
        a: "Reconstitution is the process of dissolving a lyophilized peptide powder in a sterile liquid, most commonly bacteriostatic water. The required volume depends on the vial size and your target concentration. Revive Research offers a free Reconstitution Wizard that walks researchers through the calculation step by step and generates a printable Vial Card with the exact draw-to-mark instructions for a given syringe type."
      },
      {
        q: "What is the difference between research peptides and pharmaceutical peptides?",
        a: "Pharmaceutical peptides are FDA-approved drugs manufactured under strict GMP (Good Manufacturing Practice) guidelines, prescribed by physicians, and dispensed through licensed pharmacies. Research peptides are synthesized for laboratory investigation, are not FDA-approved for any medical use, and are sold without a prescription exclusively for scientific study. While both may share the same amino acid sequences, regulatory status, intended use, and quality controls differ significantly."
      },
      {
        q: "How are Revive Research peptides tested for quality?",
        a: "Each batch goes through a multi-step quality process: synthesis by a GMP-compliant manufacturer, followed by independent third-party testing using HPLC for purity and mass spectrometry for identity confirmation. Results must meet a minimum purity threshold before the batch is released for sale. The full COA for every batch is published on our website and can be verified using the batch number printed on the product label."
      },
      {
        q: "Do research peptides expire?",
        a: "Lyophilized peptides are generally stable for 24 months or longer when stored correctly at -20°C and kept away from moisture and light. Once reconstituted into solution, stability decreases and peptides should be used within 4 weeks when refrigerated. Each product label and COA includes a specific expiry date based on the batch's stability testing. Using peptides past their expiry date may compromise research results."
      }
    ];

    const faqItems = faqs.map(({ q, a }) =>
      `  <div>\n    <dt>${escapeHtml(q)}</dt>\n    <dd>${escapeHtml(a)}</dd>\n  </div>`
    ).join('\n');

    return `<main>
  <h1>Peptide Research FAQ</h1>
  <p>Frequently asked questions about research peptides, ordering, shipping, COAs, and more.</p>
  <dl>
${faqItems}
  </dl>
  <footer>
    <nav><a href="/peptides">Shop Research Compounds</a> | <a href="/coa/verify-certificate-of-analysis">Verify COA</a> | <a href="/reconstitution-wizard">Reconstitution Wizard</a> | <a href="/contact">Contact Us</a></nav>
    <p>All compounds are for research use only. Not for human or animal consumption.</p>
  </footer>
</main>`;
  }

  // / — homepage with dynamic featured product listing
  if (cleanUrl === '/') {
    try {
      const products = await storage.getAllProductsWithDisplayPrices();
      const inStock = products.filter(p => p.inStock).slice(0, 12);
      const items = inStock.map(p => {
        const price = parseFloat(p.displayPrice) || 0;
        return `<li><a href="/peptides/${escapeHtml(p.slug || '')}">${escapeHtml(p.name)}</a>${p.category ? ` — ${escapeHtml(p.category)}` : ''}${price > 0 ? ` — $${price.toFixed(2)}` : ''}</li>`;
      }).join('\n');
      return `<main>
  <h1>Premium Research Compounds — Revive Research</h1>
  <p>Third-party tested peptides with Certificates of Analysis for every batch. Engineered with intention, built for those who don't wait for permission.</p>
  <section>
    <h2>Featured Research Compounds (${inStock.length} In Stock)</h2>
    <ul>
${items}
    </ul>
  </section>
  <section>
    <h2>Why Revive Research</h2>
    <ul>
      <li>Every batch independently verified by accredited third-party laboratory</li>
      <li>Certificates of Analysis available for every product and every batch</li>
      <li>HPLC and mass spectrometry testing on all compounds</li>
      <li>Free shipping on orders over $${FREE_SHIPPING_THRESHOLD}</li>
      <li>Research Use Only — not for human or animal consumption</li>
    </ul>
  </section>
  <nav><a href="/peptides">Browse All Compounds</a> | <a href="/research-stacks">Research Stacks</a> | <a href="/guides/peptide-education-center">Education Center</a> | <a href="/coa/verify-certificate-of-analysis">Verify COA</a></nav>
</main>`;
    } catch (err) {
      console.error('[SEO] Error pre-rendering homepage:', err);
    }
  }

  // /peptides and /shop — full product catalog listing
  if (cleanUrl === '/peptides' || cleanUrl === '/shop') {
    try {
      const products = await storage.getAllProductsWithDisplayPrices();
      const inStock = products.filter(p => p.inStock);
      const outOfStock = products.filter(p => !p.inStock);
      const sorted = [...inStock, ...outOfStock];
      const items = sorted.map(p => {
        const price = parseFloat(p.displayPrice) || 0;
        const availability = p.inStock ? 'In Stock' : 'Out of Stock';
        return `<li><a href="/peptides/${escapeHtml(p.slug || '')}">${escapeHtml(p.name)}</a> — ${escapeHtml(p.category || 'Research Compound')}${price > 0 ? ` — $${price.toFixed(2)}` : ''} — ${availability}</li>`;
      }).join('\n');
      return `<main>
  <h1>Research Compounds — Revive Research (${sorted.length} Total)</h1>
  <p>${inStock.length} compounds in stock. All third-party tested with Certificates of Analysis available for every batch. Free shipping on orders over $${FREE_SHIPPING_THRESHOLD}.</p>
  <ul>
${items}
  </ul>
  <nav><a href="/research-stacks">Research Stacks</a> | <a href="/guides/peptide-education-center">Education Center</a> | <a href="/coa/verify-certificate-of-analysis">Verify COA</a> | <a href="/contact">Contact Us</a></nav>
  <p>All compounds are for research use only. Not for human or animal consumption.</p>
</main>`;
    } catch (err) {
      console.error('[SEO] Error pre-rendering product listing:', err);
    }
  }

  // /research-stacks — stack listing
  if (cleanUrl === '/research-stacks') {
    try {
      const stacks = await storage.getResearchStacks({ showOnPage: true });
      if (stacks.length > 0) {
        const items = stacks.map(s => {
          const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          const benefits = Array.isArray(s.keyBenefits) ? s.keyBenefits.slice(0, 3) : [];
          return `<li><h2><a href="/research-stacks/${escapeHtml(slug)}">${escapeHtml(s.name)}</a></h2>${s.subtitle ? `<p>${escapeHtml(s.subtitle)}</p>` : ''}<p>${escapeHtml(s.description)}</p>${benefits.length ? `<ul>${benefits.map((b: string) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>` : ''}</li>`;
        }).join('\n');
        return `<main>
  <h1>Research Stacks — Pre-Built Peptide Bundles | Revive Research</h1>
  <p>Save 10% on curated peptide combinations. Each stack is designed around synergistic research pathways with full COA documentation for every component.</p>
  <ul>
${items}
  </ul>
  <nav><a href="/peptides">Browse All Compounds</a> | <a href="/guides/peptide-education-center">Education Center</a> | <a href="/contact">Contact Us</a></nav>
  <p>All compounds are for research use only. Not for human or animal consumption.</p>
</main>`;
      }
    } catch (err) {
      console.error('[SEO] Error pre-rendering stacks listing:', err);
    }
  }

  // /research-stacks/:slug — individual stack detail page
  const stackSlugMatch = cleanUrl.match(/^\/research-stacks\/(.+)$/);
  if (stackSlugMatch) {
    try {
      const stacks = await storage.getResearchStacks({ showOnPage: true });
      const urlSlug = stackSlugMatch[1];
      const stack = stacks.find(s => {
        const nameSlug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return nameSlug === urlSlug || s.id === urlSlug || s.detailPageId === urlSlug;
      });
      if (stack) {
        const benefits = Array.isArray(stack.keyBenefits) ? stack.keyBenefits : [];
        const applications = Array.isArray(stack.researchApplications) ? stack.researchApplications : [];
        return `<article itemscope itemtype="https://schema.org/Product">
  <header>
    <h1 itemprop="name">${escapeHtml(stack.name)}</h1>
    ${stack.subtitle ? `<p>${escapeHtml(stack.subtitle)}</p>` : ''}
  </header>
  <section itemprop="description">
    <p>${escapeHtml(stack.description)}</p>
    ${stack.longDescription ? `<p>${escapeHtml(stack.longDescription)}</p>` : ''}
  </section>
  ${benefits.length ? `<section><h2>Key Research Areas</h2><ul>${benefits.map((b: string) => `<li>${escapeHtml(b)}</li>`).join('')}</ul></section>` : ''}
  ${applications.length ? `<section><h2>Research Applications</h2><ul>${applications.map((a: string) => `<li>${escapeHtml(a)}</li>`).join('')}</ul></section>` : ''}
  <section>
    <h2>Bundle Savings</h2>
    <p>This research stack includes a 10% discount compared to purchasing compounds individually. All components are third-party tested with Certificates of Analysis available for each batch.</p>
    <p>For research use only. Not for human or animal consumption.</p>
  </section>
  <footer>
    <nav><a href="/research-stacks">All Research Stacks</a> | <a href="/peptides">Browse Individual Compounds</a> | <a href="/contact">Contact Us</a></nav>
    <p itemprop="brand" itemscope itemtype="https://schema.org/Brand"><span itemprop="name">Revive Research</span></p>
  </footer>
</article>`;
      }
    } catch (err) {
      console.error(`[SEO] Error pre-rendering stack detail "${stackSlugMatch[1]}":`, err);
    }
  }

  // /systems/:slug — body system pages (data inlined; no LucideIcon dependency on server)
  const SYSTEMS = [
    { id: 'healing',   name: 'Healing & Recovery',       description: 'Tissue repair, wound healing, and injury recovery through growth factor activation. Research peptides in this system target collagen synthesis, angiogenesis, and cellular regeneration pathways.' },
    { id: 'metabolic', name: 'Metabolic & Energy',        description: 'Energy production, fat metabolism, and mitochondrial function optimization. Compounds in this system are studied for their roles in lipolysis, insulin signaling, and thermogenesis.' },
    { id: 'growth',    name: 'Growth & Muscle',           description: 'Growth hormone pathways supporting muscle, bone, and cellular development. Research peptides here target GHRH receptors, IGF-1 production, and nitrogen retention.' },
    { id: 'cognitive', name: 'Cognitive & Brain Health',  description: 'Neuroprotection, focus enhancement, and brain-derived growth factors. Compounds in this system are studied for BDNF upregulation, synaptic plasticity, and neuroinflammation reduction.' },
    { id: 'skin',      name: 'Skin & Aesthetics',         description: 'Collagen synthesis, elastin production, and dermal regeneration. Research peptides in this system act on fibroblast activity, copper-dependent enzymes, and melanin regulation.' },
    { id: 'longevity', name: 'Longevity & Anti-Aging',    description: 'Anti-aging mechanisms including telomere support, autophagy activation, and cellular renewal. Compounds studied for NAD+ pathway support and oxidative stress reduction.' },
    { id: 'hormonal',  name: 'Hormonal & Reproductive',   description: 'Reproductive axis, endocrine signaling, and sexual health research. Peptides in this system target the hypothalamic-pituitary-gonadal axis and steroidogenesis pathways.' },
  ];
  const systemSlugMatch = cleanUrl.match(/^\/systems\/(.+)$/);
  if (systemSlugMatch) {
    const urlSlug = systemSlugMatch[1];
    const system = SYSTEMS.find(s => s.id === urlSlug);
    if (system) {
      try {
        const allProducts = await storage.getAllProductsWithDisplayPrices();
        const linked = allProducts
          .filter(p => (p.category || '').toLowerCase().includes(system.id) || (p.name || '').toLowerCase().includes(system.id))
          .slice(0, 12);
        const productSection = linked.length > 0
          ? `<section><h2>Research Compounds in This System</h2><ul>${linked.map(p => {
              const price = parseFloat(p.displayPrice) || 0;
              return `<li><a href="/peptides/${escapeHtml(p.slug || '')}">${escapeHtml(p.name)}</a>${price > 0 ? ` — $${price.toFixed(2)}` : ''}${p.inStock ? ' — In Stock' : ' — Out of Stock'}</li>`;
            }).join('')}</ul></section>`
          : '';
        return `<main>
  <h1>${escapeHtml(system.name)} Research Compounds | Revive Research</h1>
  <p>${escapeHtml(system.description)}</p>
  ${productSection}
  <section>
    <h2>Research Use Only</h2>
    <p>All compounds are sold strictly for laboratory and scientific research purposes. Not for human or animal consumption. Every batch is third-party tested with a Certificate of Analysis available for verification.</p>
  </section>
  <nav><a href="/peptides">Browse All Compounds</a> | <a href="/research-stacks">Research Stacks</a> | <a href="/guides/peptide-education-center">Education Center</a> | <a href="/coa/verify-certificate-of-analysis">Verify COA</a></nav>
</main>`;
      } catch (err) {
        console.error(`[SEO] Error pre-rendering system page "${urlSlug}":`, err);
        return `<main><h1>${escapeHtml(system.name)} Research Compounds | Revive Research</h1><p>${escapeHtml(system.description)}</p><nav><a href="/peptides">Browse All Compounds</a></nav><p>For research use only.</p></main>`;
      }
    }
  }

  // /education and /guides/peptide-education-center — article listing
  if (cleanUrl === '/education' || cleanUrl === '/guides/peptide-education-center') {
    try {
      const articles = await storage.getAllEducationArticles();
      if (articles.length > 0) {
        const items = articles.map(a =>
          `<li><h2><a href="/guides/${escapeHtml(a.slug)}">${escapeHtml(a.title)}</a></h2>${a.summary ? `<p>${escapeHtml(a.summary)}</p>` : ''}</li>`
        ).join('\n');
        return `<main>
  <h1>Peptide Research Education Center | Revive Research</h1>
  <p>${articles.length} research guides covering peptide science, quality verification, reconstitution, storage, and research applications. Written for laboratory researchers and scientists.</p>
  <ul>
${items}
  </ul>
  <nav><a href="/peptides">Shop Research Compounds</a> | <a href="/reconstitution-wizard">Reconstitution Wizard</a> | <a href="/contact">Contact Us</a></nav>
  <p>All content is for educational and research purposes only. Not for human or animal consumption.</p>
</main>`;
      }
    } catch (err) {
      console.error('[SEO] Error pre-rendering education listing:', err);
    }
  }

  if (STATIC_ROUTES[cleanUrl]) {
    const route = STATIC_ROUTES[cleanUrl];
    return `<main>
  <h1>${escapeHtml(route.title.replace(` | ${SITE_NAME}`, ''))}</h1>
  <p>${escapeHtml(route.description)}</p>
  <nav><a href="/peptides">Shop Products</a> | <a href="/guides/peptide-education-center">Education Center</a> | <a href="/contact">Contact Us</a></nav>
  <p>Revive Research — Premium research compounds with third-party COA verification.</p>
</main>`;
  }

  return '';
}

export function injectMetaTags(html: string, meta: PageMeta, preRenderedContent?: string): string {
  const escapedTitle = escapeHtml(meta.title);
  const escapedDesc = escapeHtml(meta.description);
  const ogType = meta.ogType || "website";
  const ogImage = meta.ogImage || DEFAULT_IMAGE;
  const canonical = meta.canonicalUrl || SITE_URL;
  const escapedOgImage = escapeHtml(ogImage);
  const escapedCanonical = escapeHtml(canonical);

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapedTitle}</title>`);

  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${escapedDesc}" />`
  );

  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${escapedTitle}" />`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${escapedDesc}" />`
  );
  html = html.replace(
    /<meta property="og:type" content="[^"]*" \/>/,
    `<meta property="og:type" content="${ogType}" />`
  );
  html = html.replace(
    /<meta property="og:image" content="[^"]*" \/>/,
    `<meta property="og:image" content="${escapedOgImage}" />`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${escapedCanonical}" />`
  );

  html = html.replace(
    /<meta property="og:locale" content="[^"]*" \/>/,
    `<meta property="og:locale" content="en_US" />`
  );

  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${escapedTitle}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${escapedDesc}" />`
  );
  html = html.replace(
    /<meta name="twitter:image" content="[^"]*" \/>/,
    `<meta name="twitter:image" content="${escapedOgImage}" />`
  );

  html = html.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${escapedCanonical}" />`
  );

  let jsonLdTags = '';
  if (meta.jsonLd && meta.jsonLd.length > 0) {
    jsonLdTags = meta.jsonLd.map(schema =>
      `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
    ).join('\n    ');
  }

  if (jsonLdTags) {
    html = html.replace('</head>', `    ${jsonLdTags}\n  </head>`);
  }

  if (meta.noindex) {
    html = html.replace('</head>', `    <meta name="robots" content="noindex, follow" />\n  </head>`);
  }

  if (preRenderedContent) {
    html = html.replace('<div id="root"></div>', `<div id="root"><div style="display:none" aria-hidden="true">${preRenderedContent}</div></div>`);
  }

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
