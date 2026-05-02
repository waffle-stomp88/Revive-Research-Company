import { storage } from "./storage";
import { db } from "./db";
import { savedStacks } from "@shared/schema";
import { eq } from "drizzle-orm";
import { FREE_SHIPPING_THRESHOLD } from "@shared/constants";

const SITE_NAME = "Revive Research Company";
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
}

const STATIC_ROUTES: Record<string, PageMeta> = {
  "/": {
    title: `Home | ${SITE_NAME}`,
    description: "Premium research compounds with third-party COA verification. Engineered with intention, built for those who don't wait for permission.",
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
  "/peptide-research-faq": {
    title: `Peptide Research FAQ | ${SITE_NAME}`,
    description: "Frequently asked questions about research peptides, ordering, shipping, COAs, and more. Get answers from Revive Research.",
    jsonLd: [{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": []
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
    description: "Most peptide COAs are unverified or fabricated. Learn to spot red flags in lab reports, verify Colmaric test results, and identify trustworthy vendors before you buy.",
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
      jsonLd: [{
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
      }]
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
      jsonLd: [{
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
      }]
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
    return { ...STATIC_ROUTES[cleanUrl], canonicalUrl: `${SITE_URL}${cleanUrl}` };
  }

  const productMatch = cleanUrl.match(/^\/(peptides|products)\/(.+)$/);
  if (productMatch) {
    const meta = await getProductMeta(productMatch[2]);
    if (meta) return { ...meta, canonicalUrl: `${SITE_URL}/peptides/${productMatch[2]}` };
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
          ? article.content.replace(/^#+ .*/gm, '').replace(/[*_`~\[\]]/g, '').trim().slice(0, 1000)
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
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${escapedTitle}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${escapedDesc}" />`
  );

  const ogImageTag = `<meta property="og:image" content="${escapeHtml(ogImage)}" />`;
  const canonicalTag = `<link rel="canonical" href="${escapeHtml(canonical)}" />`;
  const ogUrlTag = `<meta property="og:url" content="${escapeHtml(canonical)}" />`;

  let jsonLdTags = '';
  if (meta.jsonLd && meta.jsonLd.length > 0) {
    jsonLdTags = meta.jsonLd.map(schema =>
      `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
    ).join('\n    ');
  }

  const injection = `${ogImageTag}\n    ${ogUrlTag}\n    ${canonicalTag}${jsonLdTags ? '\n    ' + jsonLdTags : ''}`;
  html = html.replace('</head>', `    ${injection}\n  </head>`);

  if (preRenderedContent) {
    html = html.replace('<div id="root"></div>', `<div id="root">${preRenderedContent}</div>`);
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
