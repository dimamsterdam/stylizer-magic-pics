
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarClock, ThumbsUp, Lightbulb } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { ContentCard } from "@/components/dashboard/ContentCard";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { useOnboarding } from "@/hooks/useOnboarding";

const Dashboard = () => {
  const { showOnboarding, closeOnboarding, loading } = useOnboarding();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-[99.8rem] mx-auto">
      <OnboardingModal isOpen={showOnboarding} onClose={closeOnboarding} />
      <DashboardHeader />

      <div className="p-5 space-y-8 bg-[--p-background] min-h-[calc(100vh-129px)]">
        {/* Stats Grid */}
        <div className="grid gap-5 md:grid-cols-3">
          <StatCard title="Pending Review" value={12} change="+2 from yesterday" icon={CalendarClock} />
          <StatCard title="Approved Today" value={8} change="+3 from yesterday" icon={ThumbsUp} />
          <StatCard title="AI Suggestions" value={24} change="Generated overnight" icon={Lightbulb} />
        </div>

        {/* Content Grid */}
        <div className="bg-gray-50 rounded-xl p-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <ContentCard 
              title="Winter Collection Spotlight" 
              description="A cozy collection featuring your best-selling winter items with warming color palette." 
              imageUrl="/lovable-uploads/af88ce94-30e1-4875-b411-1c07060016c2.png"
              badge={{
                label: "Product Showcase",
                color: "#2563EB",
                bgColor: "rgba(219, 234, 254, 0.9)"
              }} 
            />
            <ContentCard 
              title="Holiday Gift Guide" 
              description="Curated selection of perfect gifts for every budget and style preference." 
              imageUrl="/lovable-uploads/047c9307-af3c-47c6-b2e6-ea9d51a0c8cc.png"
              badge={{
                label: "Seasonal Guide",
                color: "#9333EA",
                bgColor: "rgba(243, 232, 255, 0.9)"
              }} 
            />
            <ContentCard 
              title="New Year Collection" 
              description="Fresh styles to kick off the new year with confidence and style." 
              imageUrl="/lovable-uploads/61d9b435-6552-49b0-a269-25c905ba18c9.png"
              badge={{
                label: "New Release",
                color: "#EA580C",
                bgColor: "rgba(255, 237, 213, 0.9)"
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
