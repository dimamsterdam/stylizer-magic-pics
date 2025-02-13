
import React from "react";
import { Link } from "react-router-dom";
import { Palette } from "lucide-react";

const settingsApps = [
  {
    title: "Brand Identity",
    description: "Manage your brand's visual identity and guidelines",
    icon: Palette,
    url: "/brand"
  }
];

const Settings = () => {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-semibold text-polaris-text mb-6">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {settingsApps.map((app) => (
          <Link
            key={app.title}
            to={app.url}
            className="group block space-y-2 rounded-md border border-polaris-border bg-white p-6 hover:border-[#6D7175] transition-colors"
          >
            <div className="flex items-center gap-3">
              <app.icon className="h-6 w-6 text-polaris-text" />
              <h2 className="font-medium text-polaris-text">{app.title}</h2>
            </div>
            <p className="text-sm text-polaris-secondary">{app.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Settings;
