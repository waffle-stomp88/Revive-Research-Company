import { useEffect, useRef } from "react";
import { ROUTE_META } from "@shared/seo-meta";

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
  const canonicalDomain = 'https://reviveresearch.co';
  const rawPath = canonicalPath || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const path = rawPath === '/' ? '/' : rawPath.replace(/\/$/, '');
  const fullCanonicalUrl = `${canonicalDomain}${path}`;

  const sharedMeta = ROUTE_META[path];
  const resolvedTitle = sharedMeta ? sharedMeta.title : (title.includes('Revive Research') ? title : `${title} | Revive Research Company`);
  const resolvedDescription = sharedMeta ? sharedMeta.description : description;

  useEffect(() => {
    if (hasRun.current && document.title === resolvedTitle) {
      return;
    }
    hasRun.current = true;

    document.title = resolvedTitle;

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

    updateMetaTag('description', resolvedDescription);
    updateMetaTag('og:title', resolvedTitle, true);
    updateMetaTag('og:description', resolvedDescription, true);
    updateMetaTag('og:url', fullCanonicalUrl, true);
    updateMetaTag('og:locale', 'en_US', true);
    updateMetaTag('twitter:title', resolvedTitle);
    updateMetaTag('twitter:description', resolvedDescription);

    if (ogImage) {
      updateMetaTag('og:image', ogImage, true);
      updateMetaTag('twitter:image', ogImage);
    }

    updateLinkTag('canonical', fullCanonicalUrl);
  }, [resolvedTitle, resolvedDescription, fullCanonicalUrl, ogImage]);

  return null;
}
