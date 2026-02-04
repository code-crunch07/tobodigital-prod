'use client';

import { useState, useEffect } from 'react';

export default function SidebarContentWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(256); // w-64 = 256px

  useEffect(() => {
    const updateSidebarWidth = () => {
      const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
      setSidebarWidth(collapsed ? 80 : 256); // w-20 = 80px, w-64 = 256px
    };

    updateSidebarWidth();
    // Listen for custom event for same-tab updates
    const handleToggle = () => updateSidebarWidth();
    window.addEventListener('sidebarToggle', handleToggle);

    return () => {
      window.removeEventListener('sidebarToggle', handleToggle);
    };
  }, []);

  return (
    <div 
      className="flex-1 flex flex-col overflow-hidden transition-all duration-300"
      style={{ marginLeft: `${sidebarWidth}px` }}
    >
      {children}
    </div>
  );
}

