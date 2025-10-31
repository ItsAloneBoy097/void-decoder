import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  type?: string;
  canonicalUrl?: string;
}

export function SEOHead({ 
  title, 
  description, 
  keywords = [], 
  image = '/og-image.jpg',
  type = 'website',
  canonicalUrl
}: SEOHeadProps) {
  const location = useLocation();
  const fullTitle = `${title} | Minecraft Gallery`;
  const url = canonicalUrl || `${window.location.origin}${location.pathname}`;

  useEffect(() => {
    // Update title
    document.title = fullTitle;

    // Update meta tags
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMeta('description', description);
    if (keywords.length > 0) {
      updateMeta('keywords', keywords.join(', '));
    }

    // OpenGraph
    updateMeta('og:title', fullTitle, true);
    updateMeta('og:description', description, true);
    updateMeta('og:image', image, true);
    updateMeta('og:url', url, true);
    updateMeta('og:type', type, true);

    // Twitter
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', fullTitle);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }, [fullTitle, description, keywords, image, url, type]);

  return null;
}
