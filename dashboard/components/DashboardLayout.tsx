'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { SidebarProvider, useSidebar } from '@/components/SidebarContext';
import Sidebar from '@/components/Sidebar';
import SidebarContentWrapper from '@/components/SidebarContentWrapper';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationBell from '@/components/NotificationBell';
import UserProfileDropdown from '@/components/UserProfileDropdown';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';

function DashboardHeader() {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [scrolled, setScrolled] = useState(false);
  const storefrontUrl =
    process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3001/client';

  useEffect(() => {
    const el = document.querySelector('[data-dashboard-main]');
    if (!el) return;
    const onScroll = () => setScrolled((el as HTMLElement).scrollTop > 8);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-20 border-b border-border p-3 sm:p-4 flex justify-between items-center bg-background/95 backdrop-blur-md flex-wrap gap-2 transition-all duration-300 ${
        scrolled ? 'shadow-sm' : ''
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-9 w-9 hidden lg:inline-flex bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 transition-transform duration-200 rounded-lg"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold truncate">Welcome Back!</h2>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Tooltip content="Open storefront" side="bottom">
          <a href={storefrontUrl} target="_blank" rel="noreferrer">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 hover:border-primary/50 hover:bg-primary/5"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </Tooltip>
        <NotificationBell />
        <ThemeToggle />
        <UserProfileDropdown />
      </div>
    </header>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <SidebarContentWrapper>
        <DashboardHeader />
        <main
          data-dashboard-main
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 bg-background min-w-0 transition-colors"
        >
          {children}
        </main>
      </SidebarContentWrapper>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || 
                     pathname === '/forgot-password' || 
                     pathname.startsWith('/reset-password');

  // If on auth pages (login, forgot password, reset password), render children without sidebar
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Otherwise render with dashboard layout
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}

