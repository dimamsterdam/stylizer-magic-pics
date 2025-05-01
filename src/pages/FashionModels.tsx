
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useToast } from "@/hooks/use-toast";
import FashionModelsSection from "@/components/FashionModelsSection";
import { BrandIdentity } from "@/types/brandTypes";
import { PageHeader } from "@/components/ui/page-header";
import { Users } from "lucide-react";

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
      <div className="w-full p-6">
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
    <div className="w-full">
      <PageHeader
        title="Fashion Models"
        description="Manage the fashion models that represent your brand"
        icon={<Users className="h-5 w-5" />}
        breadcrumbs={breadcrumbItems}
        className="mb-6"
      />
      
      <div className="p-6">
        {brandIdentity && (
          <FashionModelsSection brandIdentity={brandIdentity} standalone={true} />
        )}
      </div>
    </div>
  );
};

export default FashionModels;
