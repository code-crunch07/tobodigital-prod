'use client';

import { useEffect } from 'react';
import { getPublicSiteSettings } from '@/lib/api';

export default function Favicon() {
  useEffect(() => {
    const setFavicon = async () => {
      try {
        const res = await getPublicSiteSettings();
        const favicon = res?.data?.favicon;
        if (favicon) {
          // Remove existing favicon links
          const existingLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
          existingLinks.forEach((link) => link.remove());

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
        }
      } catch (error) {
        // Ignore errors - fallback to default favicon
        console.error('Failed to load favicon:', error);
      }
    };

    setFavicon();
  }, []);

  return null;
}
