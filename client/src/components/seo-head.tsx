import { useEffect, useRef } from "react";

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
  const hasRun = useRef(false);
  // Always use the canonical non-www domain for SEO consistency
  const canonicalDomain = 'https://reviveresearch.co';
  const path = canonicalPath || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const fullCanonicalUrl = `${canonicalDomain}${path}`;

  useEffect(() => {
    const fullTitle = title === 'Revive Research' ? title : `${title} | Revive Research`;
    if (hasRun.current && document.title === fullTitle) {
      return;
    }
    hasRun.current = true;
    
    document.title = fullTitle;

    const head = document.head;
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = head.querySelector(selector) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(isProperty ? 'property' : 'name', name);
        head.appendChild(meta);
      }
      if (meta.content !== content) {
        meta.content = content;
      }
    };

    const updateLinkTag = (rel: string, href: string) => {
      let link = head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        head.appendChild(link);
      }
      if (link.href !== href) {
        link.href = href;
      }
    };

    updateMetaTag('description', description);
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:url', fullCanonicalUrl, true);
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description);
    
    if (ogImage) {
      updateMetaTag('og:image', ogImage, true);
      updateMetaTag('twitter:image', ogImage);
    }

    updateLinkTag('canonical', fullCanonicalUrl);
  }, [title, description, fullCanonicalUrl, ogImage]);

  return null;
}
