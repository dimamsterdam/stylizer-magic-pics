
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Tv, Workflow, Layout, Users, ArrowRight, Camera } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { supabase } from "@/integrations/supabase/client";
import { RecentProjects } from "@/components/home/RecentProjects";
import { Badge } from "@/components/ui/badge";

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
    details: "",
    route: "/expose",
    buttonText: "Create Spotlight",
    bgColor: "bg-gradient-to-br from-blue-50 to-indigo-100",
    accentColor: "text-indigo-600",
    featured: true,
    imageSrc: "/lovable-uploads/61d9b435-6552-49b0-a269-25c905ba18c9.png",
    badgeText: "Interactive"
  }, {
    title: "Photo Shoot",
    icon: Camera,
    description: "Generate professional product photos for your store",
    details: "",
    route: "/product-photo-shoot",
    buttonText: "Start Photo Shoot",
    bgColor: "bg-gradient-to-br from-amber-50 to-orange-100",
    accentColor: "text-orange-600",
    featured: false,
    imageSrc: "/lovable-uploads/047c9307-af3c-47c6-b2e6-ea9d51a0c8cc.png",
    badgeText: "New"
  }, {
    title: "Product Shorts",
    icon: Tv,
    description: "Create promotional videos for your products",
    details: "",
    route: "/videographer",
    buttonText: "Create Video",
    bgColor: "bg-gradient-to-br from-emerald-50 to-teal-100",
    accentColor: "text-teal-600",
    featured: true,
    imageSrc: "/lovable-uploads/85ad1b88-47a8-4226-bc2e-63fa2dcf049a.png",
    badgeText: "Video"
  }, {
    title: "Fashion Models",
    icon: Users,
    description: "Create virtual fashion models for your brand",
    details: "",
    route: "/fashion-models",
    buttonText: "Create Models",
    bgColor: "bg-gradient-to-br from-rose-50 to-pink-100",
    accentColor: "text-rose-600",
    featured: false,
    imageSrc: "/lovable-uploads/01c51803-441a-4b90-ad49-fc25ca184153.png",
    badgeText: "Coming Soon"
  }];
  
  return <div className="container mx-auto py-8 px-4">
      {/* Removed Home breadcrumb */}
      
      {isReturningUser ? <RecentProjects tools={productTools} /> : <div>
          <h1 className="text-display-xl font-bold mb-3 text-[--p-text] text-[22.5px]">Brandmachine</h1>
          <p className="text-lg mb-8 text-[--p-text-subdued]">What do you want to create today:</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {productTools.map(tool => (
              <div key={tool.title} className="relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                {tool.featured && (
                  <div className="absolute top-3 left-3 bg-[#D82C0D] text-white text-xs font-semibold px-2 py-1 rounded-sm z-10">
                    Featured
                  </div>
                )}
                <AspectRatio ratio={1/1} className="bg-white">
                  <div className={`${tool.bgColor} h-full w-full p-0 flex items-center justify-center overflow-hidden`}>
                    {tool.imageSrc ? (
                      <img 
                        src={tool.imageSrc} 
                        alt={tool.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <tool.icon className={`h-36 w-36 ${tool.accentColor}`} />
                    )}
                  </div>
                </AspectRatio>
                <div className="p-4 bg-white border-t border-[#E3E5E7]">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-[20px] font-semibold text-[#1A1F2C]">{tool.title}</h3>
                    <span className="text-[#6D7175] bg-[#F6F6F7] px-2 py-1 rounded text-xs">{tool.badgeText}</span>
                  </div>
                  <p className="text-[#6D7175] text-sm mb-4">{tool.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <tool.icon className={`h-4 w-4 mr-1 ${tool.accentColor}`} />
                      <span className="text-xs text-[#6D7175]">9 left</span>
                    </div>
                    <Link 
                      to={tool.route}
                      className="w-full mt-2"
                    >
                      <Button 
                        variant="primary" 
                        className="w-full"
                      >
                        {tool.buttonText}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>}
    </div>;
}
