import React from 'react';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[#fbf9f4] text-[#1c261e]">
      {/* Desktop Sidebar */}
      <AppSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <main className="flex-1">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
