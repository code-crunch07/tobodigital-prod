'use client';

import { useEffect } from 'react';
import { getPublicSiteSettings } from '@/lib/api';

export default function Favicon() {
  useEffect(() => {
    // Use requestIdleCallback to ensure this doesn't block navigation
    // This is critical - favicon updates should never interfere with Next.js router
    const setFavicon = async () => {
      try {
        const res = await getPublicSiteSettings();
        const favicon = res?.data?.favicon;
        if (favicon) {
          // Use requestIdleCallback to defer DOM manipulation until browser is idle
          // This ensures it doesn't interfere with Next.js navigation
          if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
              updateFavicon(favicon);
            }, { timeout: 2000 });
          } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(() => {
              updateFavicon(favicon);
            }, 500);
          }
        }
      } catch (error) {
        // Ignore errors - fallback to default favicon
        console.error('Failed to load favicon:', error);
      }
    };

    const updateFavicon = (favicon: string) => {
      // Remove existing favicon links (but keep the ones from layout metadata)
      const existingLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
      existingLinks.forEach((link) => {
        // Only remove dynamically added favicons, not the ones from Next.js metadata
        const href = link.getAttribute('href');
        if (href && !href.includes('/favicon.png')) {
          link.remove();
        }
      });

      // Determine MIME type from URL extension
      let type = 'image/x-icon';
      if (favicon.endsWith('.svg')) type = 'image/svg+xml';
      else if (favicon.endsWith('.png')) type = 'image/png';

      // Create new favicon link
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = type;
      link.href = favicon;
      document.head.appendChild(link);
    };

    // Delay favicon update significantly to ensure navigation completes first
    //const timeoutId = setTimeout(setFavicon, 300);
    //return () => clearTimeout(timeoutId);
  }, []);

  return null;
}
