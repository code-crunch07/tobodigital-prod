'use client';

import { useEffect } from 'react';
import { getPublicSiteSettings } from '@/lib/api';

const DEFAULT_TITLE = 'Tobo Digital - Modern E-commerce Store';
const DEFAULT_DESCRIPTION = 'Discover amazing products at Tobo Digital';

export default function DynamicMeta() {
  useEffect(() => {
    getPublicSiteSettings()
      .then((res) => {
        const d = res?.data;
        const title = d?.siteName?.trim() || DEFAULT_TITLE;
        const description = d?.metaDescription?.trim() || DEFAULT_DESCRIPTION;
        const keywords = d?.metaKeywords?.trim();

        document.title = title;

        const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
          let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement;
          if (!el) {
            el = document.createElement('meta');
            el.setAttribute(attr, key);
            document.head.appendChild(el);
          }
          el.content = content;
        };

        setMeta('name', 'description', description);
        setMeta('property', 'og:title', title);
        setMeta('property', 'og:description', description);
        if (keywords) setMeta('name', 'keywords', keywords);
      })
      .catch(() => {});
  }, []);

  return null;
}
