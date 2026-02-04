'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider, useSidebar } from '@/components/SidebarContext';
import Sidebar from '@/components/Sidebar';
import SidebarContentWrapper from '@/components/SidebarContentWrapper';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationBell from '@/components/NotificationBell';
import UserProfileDropdown from '@/components/UserProfileDropdown';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function DashboardHeader() {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <header className="border-b p-4 flex justify-between items-center bg-white" style={{ borderColor: '#E5E7EB' }}>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-9 w-9"
          style={{ backgroundColor: 'rgb(237, 130, 79)', color: 'white' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgb(220, 110, 60)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgb(237, 130, 79)';
          }}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
        <h2 className="text-xl md:text-2xl font-semibold">Welcome Back!</h2>
      </div>
      <div className="flex items-center gap-2">
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
        <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: '#F5F6FA' }}>
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

