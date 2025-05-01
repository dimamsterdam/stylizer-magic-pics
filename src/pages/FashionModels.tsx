
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import FashionModelsSection from "@/components/FashionModelsSection";
import { BrandIdentity } from "@/types/brandTypes";
import { PageHeader } from "@/components/ui/page-header";
import { Users, Plus, Male, Female, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const raceOptions = [
  { label: "Any", value: "any" },
  { label: "Asian", value: "Asian" },
  { label: "Black", value: "Black" },
  { label: "Caucasian", value: "Caucasian" },
  { label: "Hispanic", value: "Hispanic" },
  { label: "Middle Eastern", value: "Middle Eastern" },
  { label: "Mixed", value: "Mixed" },
];

const FashionModels = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [genderFilter, setGenderFilter] = useState<string>("Female");
  const [raceFilter, setRaceFilter] = useState<string>("any");
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleGenerateClick = () => {
    setIsGenerating(true);
    // This will be handled by the FashionModelsSection component's generate logic
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <PageHeader
          title="Fashion Models"
          description="Manage the fashion models that represent your brand"
          icon={<Users className="h-5 w-5" />}
          breadcrumbs={breadcrumbItems}
        />
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
        description="Create and manage fashion models that represent your brand identity"
        icon={<Users className="h-6 w-6" />}
        breadcrumbs={breadcrumbItems}
      />
      
      <div className="px-6 pb-6">
        <Card className="mb-6 border-polaris-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
              <div className="space-y-4 flex-grow">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Male className="h-5 w-5 text-polaris-text-subdued" />
                    <h3 className="text-polaris-text font-medium">Gender</h3>
                  </div>
                  <RadioGroup
                    value={genderFilter}
                    onValueChange={setGenderFilter}
                    className="flex items-center space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Male" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-5 w-5 text-polaris-text-subdued" />
                    <h3 className="text-polaris-text font-medium">Ethnicity</h3>
                  </div>
                  <Select value={raceFilter} onValueChange={setRaceFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Any ethnicity" />
                    </SelectTrigger>
                    <SelectContent>
                      {raceOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button
                variant="primary"
                size="lg"
                onClick={handleGenerateClick}
                className="w-full md:w-auto"
              >
                <Plus className="h-5 w-5" />
                Generate Models
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {brandIdentity && (
          <FashionModelsSection 
            brandIdentity={brandIdentity} 
            standalone={true} 
            initialGenderFilter={genderFilter}
            initialRaceFilter={raceFilter}
            isGenerateTriggered={isGenerating}
            onGenerateComplete={() => setIsGenerating(false)}
          />
        )}
      </div>
    </div>
  );
};

export default FashionModels;
