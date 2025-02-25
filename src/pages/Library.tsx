
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pen, Equal } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Breadcrumbs from "@/components/Breadcrumbs";

interface Expose {
  id: string;
  headline: string;
  hero_image_url: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  created_at: string;
}

const Library = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: exposes, isLoading } = useQuery({
    queryKey: ['exposes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exposes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Expose[];
    },
  });

  const handleEdit = (exposeId: string) => {
    navigate(`/expose/${exposeId}`);
  };

  const handlePublish = async (exposeId: string) => {
    try {
      const { error } = await supabase
        .from('exposes')
        .update({ status: 'published' })
        .eq('id', exposeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expose published to Shopify successfully!"
      });
    } catch (error) {
      console.error('Error publishing expose:', error);
      toast({
        title: "Error",
        description: "Failed to publish expose. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container py-6">
      <Breadcrumbs 
        items={[
          { label: "Home", href: "/" },
          { label: "Library", href: "/library" },
        ]} 
      />
      
      <div className="mb-8">
        <h1 className="text-display-lg text-[#1A1F2C] mb-2">Expose Library</h1>
        <p className="text-body text-[#6D7175]">Manage and publish your exposes</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin">⌛</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exposes?.map((expose) => (
            <Card key={expose.id} className="overflow-hidden border-0 shadow-sm">
              <div className="relative group">
                <img
                  src={expose.hero_image_url || '/placeholder.svg'}
                  alt={expose.headline || 'Expose'}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 bg-white/90 hover:bg-white"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem onClick={() => handleEdit(expose.id)}>
                        <Pen className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePublish(expose.id)}>
                        <Equal className="mr-2 h-4 w-4" />
                        Publish to Shopify
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardContent className="p-4">
                <h2 className="text-heading text-[#1A1F2C] mb-2">
                  {expose.headline || 'Untitled Expose'}
                </h2>
                <div className="flex items-center justify-between">
                  <span className="text-caption text-[#6D7175]">
                    {new Date(expose.created_at).toLocaleDateString()}
                  </span>
                  <span className={`text-caption px-2 py-1 rounded-full ${
                    expose.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {expose.status.charAt(0).toUpperCase() + expose.status.slice(1)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;
