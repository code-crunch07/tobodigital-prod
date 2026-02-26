'use client';

import { useSidebar } from '@/components/SidebarContext';
import { cn } from '@/lib/utils';

export default function SidebarContentWrapper({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={cn(
        'flex-1 flex flex-col overflow-hidden transition-all duration-300 min-w-0',
        'pl-14 lg:pl-0',
        isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      )}
    >
      {children}
    </div>
  );
}

