import { useEffect } from "react";
import { useLocation } from "wouter";

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogImage?: string;
}

export function SEOHead({ 
  title, 
  description, 
  canonicalPath,
  ogImage 
}: SEOHeadProps) {
  const [location] = useLocation();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const fullCanonicalUrl = `${baseUrl}${canonicalPath || location}`;

  useEffect(() => {
    document.title = `${title} | Revive Research`;

    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const updateLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
    };

    updateMetaTag('description', description);
    updateMetaTag('og:title', `${title} | Revive Research`, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:url', fullCanonicalUrl, true);
    updateMetaTag('twitter:title', `${title} | Revive Research`);
    updateMetaTag('twitter:description', description);
    
    if (ogImage) {
      updateMetaTag('og:image', ogImage, true);
      updateMetaTag('twitter:image', ogImage);
    }

    updateLinkTag('canonical', fullCanonicalUrl);

    return () => {
      document.title = 'Revive Research | Premium Peptide Research Compounds';
    };
  }, [title, description, fullCanonicalUrl, ogImage]);

  return null;
}

export const SEO_CONFIG = {
  home: {
    title: "Premium Peptide Research Compounds",
    description: "Shop third-party tested peptides for scientific research. GMP-certified compounds with Certificates of Analysis. Free shipping over $175."
  },
  products: {
    title: "Research Peptides Collection",
    description: "Browse our complete catalog of premium research peptides. Third-party lab tested, COA verified. BPC-157, TB-500, Semaglutide & more."
  },
  productsHub: {
    title: "Shop All Research Products",
    description: "Explore peptides, bulk packs, research stacks, and supplies. Premium quality compounds with verified purity and fast shipping."
  },
  cart: {
    title: "Shopping Cart",
    description: "Review your research compound order. Free shipping on orders over $175. Secure checkout with fast processing."
  },
  checkout: {
    title: "Secure Checkout",
    description: "Complete your order securely. All research compounds ship same-day before 12 PM CT with discreet packaging."
  },
  checkoutSuccess: {
    title: "Order Confirmed",
    description: "Thank you for your order. Your research compounds will ship within 24 hours with tracking provided."
  },
  coa: {
    title: "COA Verification",
    description: "Verify your Certificate of Analysis. Every batch is third-party tested for purity, identity, and sterility."
  },
  coaLibrary: {
    title: "Certificate of Analysis Library",
    description: "Access all COAs for our research compounds. Independent lab verification ensures 98%+ purity on every batch."
  },
  batchLookup: {
    title: "Batch Lookup",
    description: "Look up batch information and testing results. Trace your research compound from production to delivery."
  },
  batchArchive: {
    title: "Batch Archive",
    description: "Historical batch records and testing data. Full transparency on all research compounds we've produced."
  },
  faq: {
    title: "Frequently Asked Questions",
    description: "Get answers about research peptides, ordering, shipping, and storage. Expert guidance for researchers."
  },
  shipping: {
    title: "Shipping Information",
    description: "Free shipping over $175. Same-day dispatch before 12 PM CT. Discreet packaging with temperature protection."
  },
  terms: {
    title: "Terms of Service",
    description: "Read our terms and conditions for purchasing research compounds. For laboratory and institutional use only."
  },
  privacy: {
    title: "Privacy Policy",
    description: "How we protect your data. Your privacy is important to us. Read our complete privacy policy."
  },
  contact: {
    title: "Contact Us",
    description: "Get in touch with our research support team. Fast response times for order inquiries and product questions."
  },
  legal: {
    title: "Legal Information",
    description: "Legal notices and compliance information for research compound purchases. For qualified researchers only."
  },
  whatWeDontDo: {
    title: "Our Standards",
    description: "Learn what sets us apart. Our commitment to quality, transparency, and ethical research practices."
  },
  education: {
    title: "Education Center",
    description: "Learn about peptide research, proper handling, and storage. Free educational resources for researchers."
  },
  qualityProcess: {
    title: "Quality Process",
    description: "Our 6-step quality assurance process. From sourcing to shipping, every step is verified and documented."
  },
  packageWarm: {
    title: "Package Arrived Warm?",
    description: "Guide on peptide stability and temperature. Most research peptides remain stable during shipping."
  },
  transparency: {
    title: "Transparency",
    description: "Full transparency on sourcing, testing, and pricing. See exactly what goes into every research compound."
  },
  ethicalPricing: {
    title: "Ethical Pricing",
    description: "Fair, transparent pricing on all research compounds. No hidden fees, no price gouging, no games."
  },
  buyerChecklist: {
    title: "Buyer Checklist",
    description: "What to look for when buying research peptides. Protect your research with our quality checklist."
  },
  troubleshooting: {
    title: "Troubleshooting Guide",
    description: "Solutions for common research peptide issues. Expert guidance on reconstitution, storage, and handling."
  },
  labNotes: {
    title: "Lab Notes Blog",
    description: "Latest research updates and compound insights. Stay informed with our scientific blog."
  },
  dosageCalculator: {
    title: "Peptide Dosage Calculator",
    description: "Calculate precise dosing for your research. Professional-grade calculator for peptide reconstitution."
  },
  resourcesHub: {
    title: "Research Resources",
    description: "Tools and guides for peptide researchers. Calculators, protocols, and educational materials."
  },
  affiliate: {
    title: "Affiliate Program",
    description: "Earn commissions promoting quality research peptides. 10% commission with 30-day cookie tracking."
  },
  affiliateDashboard: {
    title: "Affiliate Dashboard",
    description: "Track your earnings and referrals. Access promotional materials and performance analytics."
  },
  dashboard: {
    title: "My Account",
    description: "Manage your orders and account settings. View order history and track shipments."
  },
  accountSettings: {
    title: "Account Settings",
    description: "Update your account preferences and security settings. Manage notifications and privacy."
  },
  admin: {
    title: "Admin Dashboard",
    description: "Manage products, orders, and site settings. Administrative control panel."
  },
  bulkPacks: {
    title: "Bulk Research Packs",
    description: "Save on larger quantities of research peptides. Bulk pricing for serious researchers."
  },
  wholesale: {
    title: "Wholesale Program",
    description: "Wholesale pricing for institutions and resellers. Contact us for volume discounts."
  },
  supplies: {
    title: "Research Supplies",
    description: "Bacteriostatic water, syringes, and research supplies. Everything you need for peptide research."
  },
  researchStacks: {
    title: "Research Stacks",
    description: "Curated peptide combinations for specific research goals. Save with bundle pricing."
  },
  notFound: {
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist. Return to our homepage to continue browsing."
  }
};
