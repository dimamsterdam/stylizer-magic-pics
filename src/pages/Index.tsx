
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Tv, Workflow, Layout, Users, ArrowRight, Camera } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { supabase } from "@/integrations/supabase/client";
import { RecentProjects } from "@/components/home/RecentProjects";

export default function Index() {
  const navigate = useNavigate();
  const [isReturningUser, setIsReturningUser] = useState(false);
  
  useEffect(() => {
    // Check if user has created content before
    const checkUserHistory = async () => {
      try {
        const {
          data: session
        } = await supabase.auth.getSession();
        if (session?.session) {
          // In a real app, query the database
          // Since we don't have a user_projects table yet, we'll simulate this
          // by checking localStorage
          const hasProjects = localStorage.getItem('hasCreatedContent') === 'true';
          setIsReturningUser(hasProjects);

          // For demo purposes, set this to true after the first visit
          localStorage.setItem('hasCreatedContent', 'true');
        }
      } catch (error) {
        console.error("Error checking user history:", error);
      }
    };
    checkUserHistory();
  }, []);
  
  const productTools = [{
    title: "Product Spotlight",
    icon: Image,
    description: "Create beautiful hero images for your product pages",
    details: "", // Added this to fix the TypeScript error
    route: "/expose",
    buttonText: "Create Spotlight",
    bgColor: "bg-gradient-to-br from-blue-50 to-indigo-100",
    accentColor: "text-indigo-600"
  }, {
    title: "Photo Shoot",
    icon: Camera,
    description: "Generate professional product photos for your store",
    details: "", // Added this to fix the TypeScript error
    route: "/product-photo-shoot",
    buttonText: "Start Photo Shoot",
    bgColor: "bg-gradient-to-br from-amber-50 to-orange-100",
    accentColor: "text-orange-600"
  }, {
    title: "Product Shorts",
    icon: Tv,
    description: "Create promotional videos for your products",
    details: "", // Added this to fix the TypeScript error
    route: "/videographer",
    buttonText: "Create Video",
    bgColor: "bg-gradient-to-br from-emerald-50 to-teal-100",
    accentColor: "text-teal-600"
  }, {
    title: "Fashion Models",
    icon: Users,
    description: "Create virtual fashion models for your brand",
    details: "", // Added this to fix the TypeScript error
    route: "/fashion-models",
    buttonText: "Create Models",
    bgColor: "bg-gradient-to-br from-rose-50 to-pink-100",
    accentColor: "text-rose-600"
  }];
  
  return <div className="container mx-auto py-8 px-4">
      {/* Removed Home breadcrumb */}
      
      {isReturningUser ? <RecentProjects tools={productTools} /> : <div>
          <h1 className="text-display-xl font-bold mb-3 text-[--p-text] text-[22.5px]">Brandmachine</h1>
          <p className="text-lg mb-8 text-[--p-text-subdued]">What do you want to create today:</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productTools.map(tool => <Card key={tool.title} className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                <AspectRatio ratio={6 / 1} className={`${tool.bgColor} w-full`}>
                  <div className="flex items-center h-full p-2">
                    <tool.icon className={`h-6 w-6 mr-2 ${tool.accentColor}`} />
                    <h3 className="font-medium">{tool.title}</h3>
                  </div>
                </AspectRatio>
                <CardHeader className="pb-2">
                  <CardDescription className="text-body-md text-[--p-text-subdued]">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0 flex justify-end">
                  <Link 
                    to={tool.route} 
                    className="text-body-sm font-semibold text-[#888888] hover:text-[#1A1F2C] flex items-center"
                  >
                    {tool.buttonText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </CardFooter>
              </Card>)}
          </div>
        </div>}
    </div>;
}
