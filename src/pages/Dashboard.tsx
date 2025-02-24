
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarClock, ThumbsUp, Lightbulb } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ContentCard } from "@/components/dashboard/ContentCard";

const Dashboard = () => {
  return <div className="max-w-[99.8rem] mx-auto">
      <DashboardHeader />

      <div className="p-5 space-y-5 bg-[--p-background] min-h-[calc(100vh-129px)]">
        {/* Stats Grid */}
        <div className="grid gap-5 md:grid-cols-3">
          <StatCard title="Pending Review" value={12} change="+2 from yesterday" icon={CalendarClock} />
          <StatCard title="Approved Today" value={8} change="+3 from yesterday" icon={ThumbsUp} />
          <StatCard title="AI Suggestions" value={24} change="Generated overnight" icon={Lightbulb} />
        </div>

        {/* Content Tabs */}
        <div className="bg-[--p-surface] rounded-lg shadow-[--p-shadow-card]">
          <Tabs defaultValue="seasonality" className="w-full">
            <div className="border-b border-[--p-border]">
              
            </div>

            <div className="p-5">
              <TabsContent value="seasonality" className="mt-0">
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  <ContentCard 
                    title="Christmas Collection Launch" 
                    description="Holiday season campaign featuring new arrivals" 
                    imageUrl="/lovable-uploads/af88ce94-30e1-4875-b411-1c07060016c2.png"
                    badge={{
                      label: "Seasonality",
                      color: "#C05717",
                      bgColor: "#FDF8F3"
                    }} 
                  />
                  <ContentCard 
                    title="Winter Essentials" 
                    description="Curated collection of seasonal must-haves" 
                    imageUrl="/lovable-uploads/047c9307-af3c-47c6-b2e6-ea9d51a0c8cc.png"
                    badge={{
                      label: "Lookbook",
                      color: "#1D6FD0",
                      bgColor: "#EBF5FA"
                    }} 
                  />
                  <ContentCard 
                    title="Holiday Gift Guide" 
                    description="Interactive video showcase of gift ideas" 
                    imageUrl="/lovable-uploads/61d9b435-6552-49b0-a269-25c905ba18c9.png"
                    badge={{
                      label: "Video",
                      color: "#5C248D",
                      bgColor: "#F6F0FD"
                    }} 
                  />
                </div>
              </TabsContent>

              <TabsContent value="catalog" className="mt-0">
                <div className="text-center py-8 text-[--p-text-subdued]">
                  Catalog update suggestions will appear here
                </div>
              </TabsContent>

              <TabsContent value="sales" className="mt-0">
                <div className="text-center py-8 text-[--p-text-subdued]">
                  Sales-driven suggestions will appear here
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>;
};

export default Dashboard;
