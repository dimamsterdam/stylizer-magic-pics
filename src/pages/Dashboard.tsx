
import React from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";

const Dashboard = () => {
  return (
    <div className="min-h-screen">
      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <Breadcrumb 
            className="mb-4" 
            items={[
              {
                label: 'Home',
                href: '/'
              },
              {
                label: 'Dashboard',
                href: '/dashboard'
              }
            ]} 
          />
          <h1 className="text-display-lg text-polaris-text mt-4">Dashboard</h1>
          <p className="text-body-md text-polaris-secondary mt-1">
            Overview of your brand and content
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Add dashboard cards and content here */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
