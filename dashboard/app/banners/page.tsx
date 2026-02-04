'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BannersPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to marketing/banners where the actual banner management is located
    router.replace('/marketing/banners');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

