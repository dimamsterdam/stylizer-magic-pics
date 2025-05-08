import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Link } from 'react-router-dom';
import { Image, Tv, Workflow, Layout, Users, ArrowRight, Camera } from "lucide-react";
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
}

interface RecentProject {
  id: string;
  title: string;
  type: string;
  route: string;
  imageUrl?: string;
  createdAt: string;
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
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() 
          },
          { 
            id: '2', 
            title: 'Fall Fashion', 
            type: 'stylizer', 
            route: '/stylizer',
            imageUrl: '/lovable-uploads/61d9b435-6552-49b0-a269-25c905ba18c9.png',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() 
          },
          { 
            id: '3', 
            title: 'Winter Collection', 
            type: 'expose', 
            route: '/expose',
            imageUrl: '/lovable-uploads/85ad1b88-47a8-4226-bc2e-63fa2dcf049a.png',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() 
          },
          { 
            id: '4', 
            title: 'Product Promotion', 
            type: 'videographer', 
            route: '/videographer',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() 
          },
          { 
            id: '5', 
            title: 'Fashion Models', 
            type: 'fashion-models', 
            route: '/fashion-models',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString() 
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
      case 'stylizer': return Workflow;
      case 'expose': return Image;
      case 'videographer': return Tv;
      case 'fashion-models': return Users;
      case 'product-photo-shoot': return Camera;
      default: return Layout;
    }
  };

  const getTitleForType = (type: string) => {
    switch (type) {
      case 'stylizer': return 'Stylizer';
      case 'expose': return 'Product Spotlight';
      case 'videographer': return 'Product Video';
      case 'fashion-models': return 'Fashion Models';
      case 'product-photo-shoot': return 'Photo Shoot';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getRecentProjectsForType = (type: string) => {
    return recentProjects.filter(project => project.type === type);
  };

  return (
    <div>
      <h1 className="text-display-xl font-bold mb-3 text-[--p-text] text-[22.5px]">Welcome back</h1>
      
      {/* Recently Created with Filter Tabs */}
      <div className="mb-10">
        <h2 className="text-display-md font-semibold mb-4 text-[--p-text] text-[14.5px]">Recently created</h2>
        
        <Tabs defaultValue="all" className="w-full mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="stylizer">Stylizer</TabsTrigger>
            <TabsTrigger value="expose">Product Spotlight</TabsTrigger>
            <TabsTrigger value="videographer">Video</TabsTrigger>
            <TabsTrigger value="product-photo-shoot">Photo Shoot</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <Carousel className="w-full">
              <CarouselContent>
                {recentProjects.slice(0, 5).map((project) => {
                  const Icon = getIconForType(project.type);
                  return (
                    <CarouselItem key={project.id} className="md:basis-1/2 lg:basis-1/3 pl-1">
                      <Link to={project.route}>
                        <Card className="h-full group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300">
                          <AspectRatio ratio={16/9} className="bg-gray-50 w-full">
                            <div className="flex items-center justify-center h-full">
                              {project.imageUrl ? (
                                <img 
                                  src={project.imageUrl} 
                                  alt={project.title} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Icon className="h-12 w-12 text-gray-400" />
                              )}
                            </div>
                          </AspectRatio>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-display-sm text-[--p-text]">{project.title}</CardTitle>
                            <CardDescription className="flex items-center text-[--p-text-subdued]">
                              <Icon className="h-4 w-4 mr-1" />
                              {getTitleForType(project.type)}
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      </Link>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <div className="flex justify-end gap-2 mt-4">
                <CarouselPrevious className="static transform-none mr-2" />
                <CarouselNext className="static transform-none" />
              </div>
            </Carousel>
          </TabsContent>
          
          {/* Tab content for other types */}
          {['stylizer', 'expose', 'videographer', 'product-photo-shoot'].map((type) => (
            <TabsContent key={type} value={type} className="mt-4">
              <Carousel className="w-full">
                <CarouselContent>
                  {getRecentProjectsForType(type).length > 0 ? (
                    getRecentProjectsForType(type).map((project) => {
                      const Icon = getIconForType(project.type);
                      return (
                        <CarouselItem key={project.id} className="md:basis-1/2 lg:basis-1/3 pl-1">
                          <Link to={project.route}>
                            <Card className="h-full group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300">
                              <AspectRatio ratio={16/9} className="bg-gray-50 w-full">
                                <div className="flex items-center justify-center h-full">
                                  {project.imageUrl ? (
                                    <img 
                                      src={project.imageUrl} 
                                      alt={project.title} 
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Icon className="h-12 w-12 text-gray-400" />
                                  )}
                                </div>
                              </AspectRatio>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-display-sm text-[--p-text]">{project.title}</CardTitle>
                                <CardDescription className="flex items-center text-[--p-text-subdued]">
                                  <Icon className="h-4 w-4 mr-1" />
                                  {getTitleForType(project.type)}
                                </CardDescription>
                              </CardHeader>
                            </Card>
                          </Link>
                        </CarouselItem>
                      );
                    })
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Card key={tool.title} className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
              <AspectRatio ratio={6/1} className={`${tool.bgColor} w-full`}>
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
                  className="text-body-sm font-bold text-[#888888] hover:text-[#1A1F2C] flex items-center"
                >
                  {tool.buttonText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
