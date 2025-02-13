
import React from "react";
import { Link } from "react-router-dom";
import { Palette, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

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
    <div className="p-4 sm:p-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="p-6">
          <h1 className="text-2xl font-semibold text-[#1A1F2C] tracking-tight">
            Settings
          </h1>
          <p className="text-[#6D7175] mt-2">
            Configure your application settings and manage your brand identity.
          </p>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {settingsApps.map((app) => (
              <Link 
                key={app.title}
                to={app.url} 
                className="group p-4 border rounded-lg hover:border-[#9b87f5] transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-[#1A1F2C]">{app.title}</h3>
                  <ArrowRight className="h-4 w-4 text-[#9b87f5] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm text-[#6D7175]">
                  {app.description}
                </p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
