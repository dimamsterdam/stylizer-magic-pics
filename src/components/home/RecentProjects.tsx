
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface Tool {
  title: string;
  icon: React.ElementType;
  description: string;
  details: string;
  route: string;
  buttonText: string;
  bgColor: string;
  accentColor: string;
}

interface RecentProject {
  id: string;
  name: string;
  type: string;
  created_at: string;
  thumbnail_url?: string;
  route: string;
}

interface RecentProjectsProps {
  tools: Tool[];
}

export function RecentProjects({ tools }: RecentProjectsProps) {
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentProjects = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (session?.session) {
          const { data } = await supabase
            .from('user_projects')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(6);
          
          if (data) {
            // Map the data to include routes
            const projectsWithRoutes = data.map(project => {
              // Determine route based on project type
              let route = '/dashboard';
              if (project.type === 'spotlight') route = '/expose';
              else if (project.type === 'photoshoot') route = '/product-photo-shoot';
              else if (project.type === 'video') route = '/videographer';
              else if (project.type === 'editor') route = '/stylizer';
              else if (project.type === 'models') route = '/fashion-models';
              
              return {
                ...project,
                route
              };
            });
            
            setRecentProjects(projectsWithRoutes);
          }
        }
      } catch (error) {
        console.error("Error fetching recent projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentProjects();
  }, []);

  // For demo purposes, generate mock data if no real data exists
  useEffect(() => {
    if (!loading && recentProjects.length === 0) {
      const mockProjects: RecentProject[] = [
        {
          id: '1',
          name: 'Summer Collection Banner',
          type: 'spotlight',
          created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          thumbnail_url: '/placeholder.svg',
          route: '/expose'
        },
        {
          id: '2',
          name: 'Product Demo Video',
          type: 'video',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          thumbnail_url: '/placeholder.svg',
          route: '/videographer'
        },
        {
          id: '3',
          name: 'Winter Collection Shoot',
          type: 'photoshoot',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          thumbnail_url: '/placeholder.svg',
          route: '/product-photo-shoot'
        }
      ];
      setRecentProjects(mockProjects);
    }
  }, [loading, recentProjects]);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} ${interval === 1 ? 'year' : 'years'} ago`;
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} ${interval === 1 ? 'month' : 'months'} ago`;
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} ${interval === 1 ? 'day' : 'days'} ago`;
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} ${interval === 1 ? 'hour' : 'hours'} ago`;
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} ${interval === 1 ? 'minute' : 'minutes'} ago`;
    
    return 'Just now';
  };

  return (
    <div>
      <h1 className="text-display-xl font-bold mb-3 text-[--p-text]">Welcome back</h1>

      <Tabs defaultValue="recent" className="w-full mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="recent">Recent Work</TabsTrigger>
          <TabsTrigger value="all">All Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          <div className="mb-6">
            <h2 className="text-display-md font-semibold mb-4 text-[--p-text]">
              Pick up where you left off
            </h2>
            
            <div className="mb-8">
              <Carousel className="w-full">
                <CarouselContent>
                  {recentProjects.map((project) => (
                    <CarouselItem key={project.id} className="md:basis-1/2 lg:basis-1/3">
                      <Link to={project.route} className="block h-full">
                        <Card className="h-full flex flex-col hover:shadow-md transition-shadow border-[--p-border-subdued]">
                          <AspectRatio ratio={16/9}>
                            <img 
                              src={project.thumbnail_url || '/placeholder.svg'} 
                              alt={project.name} 
                              className="object-cover w-full h-full rounded-t-md"
                            />
                          </AspectRatio>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-display-sm text-[--p-text]">{project.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{getTimeAgo(project.created_at)}</span>
                            </CardDescription>
                          </CardHeader>
                          <CardFooter className="mt-auto">
                            <Button variant="plain" className="text-[--p-interactive] hover:text-[--p-interactive-hovered]">
                              Continue working
                            </Button>
                          </CardFooter>
                        </Card>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-1" />
                <CarouselNext className="right-1" />
              </Carousel>
            </div>
          </div>

          <div>
            <h2 className="text-display-md font-semibold mb-4 text-[--p-text]">
              Start something new
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tools.slice(0, 3).map((tool) => (
                <Card key={tool.title} className="group overflow-hidden border-[--p-border-subdued] hover:shadow-md transition-all duration-300 h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <div className={`rounded-full p-2 w-10 h-10 flex items-center justify-center ${tool.bgColor} mb-2`}>
                      <tool.icon className={`h-5 w-5 ${tool.accentColor}`} />
                    </div>
                    <CardTitle className="text-display-sm text-[--p-text]">
                      {tool.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-[--p-text-subdued] text-body-sm">{tool.description}</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button asChild variant="plain" className="text-[--p-interactive] hover:text-[--p-interactive-hovered] p-0">
                      <Link to={tool.route} className="flex items-center">
                        {tool.buttonText}
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Card key={tool.title} className="group overflow-hidden border-[--p-border-subdued] hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                <AspectRatio ratio={3/1} className={`${tool.bgColor} w-full`}>
                  <div className="flex items-center justify-center h-full p-6">
                    <tool.icon className={`h-12 w-12 ${tool.accentColor}`} />
                  </div>
                </AspectRatio>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-display-md text-[--p-text]">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="text-body-md text-[--p-text-subdued]">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-[--p-text-subdued]">{tool.details}</p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button asChild variant="primary" className="w-full group-hover:bg-[#1b5bab] transition-colors">
                    <Link to={tool.route} className="flex items-center justify-center">
                      {tool.buttonText}
                      <ArrowRight className="ml-2 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
