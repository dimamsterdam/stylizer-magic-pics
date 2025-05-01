
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import { GlobalSidebar } from './components/GlobalSidebar';

const Layout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen bg-white">
        <GlobalSidebar />
        <main className="flex-1 p-4">
          <div className="max-w-7xl mx-auto bg-white rounded-lg">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
