import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Link } from 'react-router-dom';
import { Image, Tv, Users, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ToolCard {
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  details: string;
  route: string;
  buttonText: string;
  bgColor: string;
  accentColor: string;
  featured?: boolean;
  imageSrc?: string;
}

interface RecentProject {
  id: string;
  title: string;
  type: string;
  route: string;
  imageUrl?: string;
  createdAt: string;
  featured?: boolean;
}

export function RecentProjects({ tools }: { tools: ToolCard[] }) {
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentProjects = async () => {
      setIsLoading(true);
      try {
        // Get sample recent projects since we don't have a real user_projects table
        // In a real app, we would query the user_projects table
        
        // Using sample data for demonstration purposes
        const sampleProjects: RecentProject[] = [
          { 
            id: '1', 
            title: 'Summer Collection', 
            type: 'product-photo-shoot', 
            route: '/product-photo-shoot',
            imageUrl: '/lovable-uploads/047c9307-af3c-47c6-b2e6-ea9d51a0c8cc.png',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            featured: true
          },
          { 
            id: '2', 
            title: 'Fall Fashion', 
            type: 'expose', 
            route: '/expose',
            imageUrl: '/lovable-uploads/61d9b435-6552-49b0-a269-25c905ba18c9.png',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            featured: false
          },
          { 
            id: '3', 
            title: 'Winter Collection', 
            type: 'expose', 
            route: '/expose',
            imageUrl: '/lovable-uploads/85ad1b88-47a8-4226-bc2e-63fa2dcf049a.png',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            featured: true
          },
          { 
            id: '4', 
            title: 'Product Promotion', 
            type: 'videographer', 
            route: '/videographer',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
            featured: false
          },
          { 
            id: '5', 
            title: 'Fashion Models', 
            type: 'fashion-models', 
            route: '/fashion-models',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
            featured: false
          }
        ];
        
        setRecentProjects(sampleProjects);
      } catch (error) {
        console.error('Error fetching recent projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentProjects();
  }, []);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'expose': return Image;
      case 'videographer': return Tv;
      case 'fashion-models': return Users;
      case 'product-photo-shoot': return Camera;
      default: return Image;
    }
  };

  const getTitleForType = (type: string) => {
    switch (type) {
      case 'expose': return 'Product Spotlight';
      case 'videographer': return 'Product Shorts';
      case 'fashion-models': return 'Fashion Models';
      case 'product-photo-shoot': return 'Photo Shoot';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getBgColorForType = (type: string) => {
    switch (type) {
      case 'expose': return 'bg-gradient-to-br from-blue-50 to-indigo-100';
      case 'videographer': return 'bg-gradient-to-br from-emerald-50 to-teal-100';
      case 'fashion-models': return 'bg-gradient-to-br from-rose-50 to-pink-100';
      case 'product-photo-shoot': return 'bg-gradient-to-br from-amber-50 to-orange-100';
      default: return 'bg-gradient-to-br from-gray-50 to-gray-100';
    }
  };

  const getAccentColorForType = (type: string) => {
    switch (type) {
      case 'expose': return 'text-indigo-600';
      case 'videographer': return 'text-teal-600';
      case 'fashion-models': return 'text-rose-600';
      case 'product-photo-shoot': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getRecentProjectsForType = (type: string) => {
    return recentProjects.filter(project => project.type === type);
  };

  const renderProjectCard = (project: RecentProject) => {
    const Icon = getIconForType(project.type);
    const bgColor = getBgColorForType(project.type);
    const accentColor = getAccentColorForType(project.type);
    
    return (
      <div className="relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        {project.featured && (
          <div className="absolute top-3 left-3 bg-[#D82C0D] text-white text-xs font-semibold px-2 py-1 rounded-sm z-10">
            Featured
          </div>
        )}
        <AspectRatio ratio={1/1} className="bg-white">
          {project.imageUrl ? (
            <img 
              src={project.imageUrl} 
              alt={project.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`${bgColor} h-full w-full p-0 flex items-center justify-center overflow-hidden`}>
              <Icon className={`h-36 w-36 ${accentColor}`} />
            </div>
          )}
        </AspectRatio>
        <div className="p-4 bg-white border-t border-[#E3E5E7]">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-[20px] font-semibold text-[#1A1F2C]">{project.title}</h3>
            <span className="text-[#6D7175] bg-[#F6F6F7] px-2 py-1 rounded text-xs">AI-powered</span>
          </div>
          <p className="text-[#6D7175] text-sm mb-4 flex items-center">
            <Icon className="h-4 w-4 mr-1" />
            {getTitleForType(project.type)}
          </p>
          <Link 
            to={project.route}
            className="w-full mt-2"
          >
            <Button 
              variant="primary" 
              className="w-full"
            >
              Continue Project
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-display-xl font-bold mb-3 text-[--p-text] text-[22.5px]">Brandmachine</h1>
      
      {/* Recently Created with Filter Tabs */}
      <div className="mb-10">
        <h2 className="text-display-md font-semibold mb-4 text-[--p-text] text-[14.5px]">Recently created</h2>
        
        <Tabs defaultValue="all" className="w-full mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="expose">Product Spotlight</TabsTrigger>
            <TabsTrigger value="videographer">Product Shorts</TabsTrigger>
            <TabsTrigger value="product-photo-shoot">Photo Shoot</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <Carousel className="w-full">
              <CarouselContent>
                {recentProjects.slice(0, 5).map((project) => (
                  <CarouselItem key={project.id} className="md:basis-1/2 lg:basis-1/2 pl-1">
                    <Link to={project.route} className="block">
                      {renderProjectCard(project)}
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-end gap-2 mt-4">
                <CarouselPrevious className="static transform-none mr-2" />
                <CarouselNext className="static transform-none" />
              </div>
            </Carousel>
          </TabsContent>
          
          {/* Tab content for other types */}
          {['expose', 'videographer', 'product-photo-shoot'].map((type) => (
            <TabsContent key={type} value={type} className="mt-4">
              <Carousel className="w-full">
                <CarouselContent>
                  {getRecentProjectsForType(type).length > 0 ? (
                    getRecentProjectsForType(type).map((project) => (
                      <CarouselItem key={project.id} className="md:basis-1/2 lg:basis-1/2 pl-1">
                        <Link to={project.route} className="block">
                          {renderProjectCard(project)}
                        </Link>
                      </CarouselItem>
                    ))
                  ) : (
                    <CarouselItem className="basis-full pl-1">
                      <div className="text-center py-10">
                        <p className="text-[--p-text-subdued]">No recent {getTitleForType(type)} projects found.</p>
                      </div>
                    </CarouselItem>
                  )}
                </CarouselContent>
                <div className="flex justify-end gap-2 mt-4">
                  <CarouselPrevious className="static transform-none mr-2" />
                  <CarouselNext className="static transform-none" />
                </div>
              </Carousel>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Create New Section */}
      <div>
        <h2 className="text-display-md font-semibold mb-4 text-[--p-text] text-[14.5px]">Create new</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <div key={tool.title} className="relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
              {tool.featured && (
                <div className="absolute top-3 left-3 bg-[#D82C0D] text-white text-xs font-semibold px-2 py-1 rounded-sm z-10">
                  Featured
                </div>
              )}
              <AspectRatio ratio={1/1} className="bg-white">
                {tool.imageSrc ? (
                  <img 
                    src={tool.imageSrc} 
                    alt={tool.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`${tool.bgColor} h-full w-full p-4 flex items-center justify-center`}>
                    <tool.icon className={`h-36 w-36 ${tool.accentColor}`} />
                  </div>
                )}
              </AspectRatio>
              <div className="p-4 bg-white border-t border-[#E3E5E7]">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-[20px] font-semibold text-[#1A1F2C]">{tool.title}</h3>
                  <span className="text-[#6D7175] bg-[#F6F6F7] px-2 py-1 rounded text-xs">AI-powered</span>
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
      </div>
    </div>
  );
}
