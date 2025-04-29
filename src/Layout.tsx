
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import { GlobalSidebar } from './components/GlobalSidebar';

const Layout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="flex w-full">
        <GlobalSidebar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
