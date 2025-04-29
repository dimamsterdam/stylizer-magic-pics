
import React from 'react';
import { Outlet } from 'react-router-dom';
import { GlobalSidebar } from './components/GlobalSidebar';

const Layout: React.FC = () => {
  return (
    <div className="flex">
      <GlobalSidebar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
