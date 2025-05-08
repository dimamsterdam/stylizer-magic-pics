
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
    imageSrc: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    route: "/expose",
    buttonText: "Create Spotlight",
    bgColor: "bg-gradient-to-br from-blue-50 to-indigo-100",
    accentColor: "text-indigo-600"
  }, {
    title: "Product Photo Shoot",
    icon: Camera,
    description: "Generate professional product photos for your store",
    imageSrc: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    route: "/product-photo-shoot",
    buttonText: "Start Photo Shoot",
    bgColor: "bg-gradient-to-br from-amber-50 to-orange-100",
    accentColor: "text-orange-600"
  }, {
    title: "Video Creator",
    icon: Tv,
    description: "Create promotional videos for your products",
    imageSrc: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    route: "/videographer",
    buttonText: "Create Video",
    bgColor: "bg-gradient-to-br from-emerald-50 to-teal-100",
    accentColor: "text-teal-600"
  }, {
    title: "Image Editor",
    icon: Workflow,
    description: "Edit and enhance product images",
    imageSrc: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    route: "/stylizer",
    buttonText: "Edit Images",
    bgColor: "bg-gradient-to-br from-purple-50 to-fuchsia-100",
    accentColor: "text-fuchsia-600"
  }, {
    title: "Fashion Models",
    icon: Users,
    description: "Create virtual fashion models for your brand",
    imageSrc: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    route: "/fashion-models",
    buttonText: "Create Models",
    bgColor: "bg-gradient-to-br from-rose-50 to-pink-100",
    accentColor: "text-rose-600"
  }, {
    title: "Brand Dashboard",
    icon: Layout,
    description: "Manage your brand assets and statistics",
    imageSrc: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    route: "/dashboard",
    buttonText: "Go to Dashboard",
    bgColor: "bg-gradient-to-br from-sky-50 to-cyan-100",
    accentColor: "text-cyan-600"
  }];
  return <div className="container mx-auto py-8 px-4">
      {/* Breadcrumbs */}
      <div className="flex mb-6 items-center text-sm">
        <span className="text-[--p-text]">Home</span>
      </div>
      
      {isReturningUser ? <RecentProjects tools={productTools} /> : <div>
          <h1 className="text-display-xl font-bold mb-3 text-[--p-text] text-[22.5px]">Welcome to Brandmachine</h1>
          <p className="text-lg mb-8 text-[--p-text-subdued]">What do you want to create today:</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productTools.map(tool => (
              <Card key={tool.title} className="group overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col border-0">
                <AspectRatio ratio={16 / 9} className="w-full">
                  <img 
                    src={tool.imageSrc} 
                    alt={tool.title} 
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
                <AspectRatio ratio={12 / 1} className={`w-full`}>
                  <div className="flex items-center h-full p-2">
                    <tool.icon className={`h-5 w-5 mr-2 ${tool.accentColor}`} />
                    <h3 className="font-medium">{tool.title}</h3>
                  </div>
                </AspectRatio>
                <CardHeader className="pb-0 pt-2">
                  <CardDescription className="text-body-md text-[--p-text-subdued] text-left">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto pt-2 pb-4">
                  <Button asChild variant="monochrome" className="w-full group-hover:bg-[#333333] transition-colors">
                    <Link to={tool.route} className="flex items-center justify-center">
                      {tool.buttonText}
                      <ArrowRight className="ml-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>}
    </div>;
}
