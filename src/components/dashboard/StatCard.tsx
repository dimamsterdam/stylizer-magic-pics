
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
}

export const StatCard = ({ title, value, change, icon: Icon }: StatCardProps) => {
  return (
    <Card className="bg-[--p-surface] shadow-[--p-shadow-card] hover:shadow-[--p-shadow-card-hover] transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[--p-text]">{title}</CardTitle>
        <Icon className="h-5 w-5 text-[--p-icon]" />
      </CardHeader>
      <CardContent>
        <div className="text-[2rem] font-semibold text-[--p-text]">{value}</div>
        {change && (
          <p className="text-sm text-[--p-text-subdued]">
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
