import React from "react";
import { Button } from "@/components/ui/button";
export const DashboardHeader = () => {
  return <div className="border-b border-[--p-border-subdued] bg-[--p-surface]">
      <div className="px-5 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[2rem] leading-[2.8rem] font-medium text-[--p-text]">Made for you</h1>
            <p className="mt-1 text-[--p-text-subdued] text-base">Review and manage content suggestions Brandmachine made for you</p>
          </div>
          <div className="flex items-center gap-2">
            
            <Button className="h-9 gap-2 bg-[--p-action-primary]">Brand Calendar</Button>
          </div>
        </div>
      </div>
    </div>;
};