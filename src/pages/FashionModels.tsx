
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useToast } from "@/hooks/use-toast";
import FashionModelsSection from "@/components/FashionModelsSection";
import { BrandIdentity } from "@/types/brandTypes";

const FashionModels = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: brandIdentity, isLoading } = useQuery({
    queryKey: ['brandIdentity'],
    queryFn: async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error("No authenticated user");
      }

      const { data, error } = await supabase
        .from('brand_identity')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Brand Identity Not Found",
          description: "Please set up your brand identity first",
          variant: "destructive"
        });
        navigate("/brand");
        throw new Error("No brand identity found");
      }
      
      // Cast JSON data to our type
      const typedData = {
        ...data,
        brand_models: data.brand_models ? data.brand_models.map((model: any) => model as any) : []
      } as BrandIdentity;
      
      return typedData;
    },
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching brand identity:', error);
        if (error.message === "No authenticated user") {
          navigate("/auth");
        } else if (error.message !== "No brand identity found") {
          toast({
            title: "Error",
            description: "Failed to load brand models",
            variant: "destructive"
          });
        }
      }
    }
  });

  const breadcrumbItems = [{
    label: "Home",
    href: "/"
  }, {
    label: "Fashion Models",
    href: "/fashion-models"
  }];

  if (isLoading) {
    return (
      <div className="container py-6">
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-polaris-border-highlight"></div>
        </div>
      </div>
    );
  }

  if (!brandIdentity) {
    return null; // Navigation will occur due to the query
  }

  return (
    <div className="container py-6">
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />
      
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-polaris-text">Fashion Models</h1>
      </div>
      
      <div className="space-y-8">
        {brandIdentity && (
          <section className="space-y-4">
            <FashionModelsSection brandIdentity={brandIdentity} standalone={true} />
          </section>
        )}
      </div>
    </div>
  );
};

export default FashionModels;
