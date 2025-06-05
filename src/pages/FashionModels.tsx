import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/page-header";
import { Users, UserCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FashionModelsPreviewPanel } from "@/components/fashion/FashionModelsPreviewPanel";
import { StarredModelsTable } from "@/components/fashion/StarredModelsTable";
import { ModelImageModal } from "@/components/fashion/ModelImageModal";
import { PlanLimitModal } from "@/components/fashion/PlanLimitModal";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

const FashionModels = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedModels, setGeneratedModels] = useState<any[]>([]);
  const [starredModels, setStarredModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isPlanLimitModalOpen, setIsPlanLimitModalOpen] = useState(false);

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
      
      return data;
    },
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching brand identity:', error);
        if (error.message === "No authenticated user") {
          navigate("/auth");
        } else if (error.message !== "No brand identity found") {
          toast({
            title: "Error",
            description: "Failed to load brand identity",
            variant: "destructive"
          });
        }
      }
    }
  });

  const breadcrumbItems = [
    {
      label: "Home",
      href: "/"
    },
    {
      label: "Fashion Models",
      href: "/fashion-models"
    }
  ];

  const handleGenerateModels = async () => {
    if (!selectedGender || !brandIdentity) return;
    
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-fashion-models', {
        body: {
          brandIdentity: {
            brand_name: brandIdentity.brand_name,
            values: brandIdentity.values || [],
            characteristics: brandIdentity.characteristics || [],
            age_range_min: brandIdentity.age_range_min || 18,
            age_range_max: brandIdentity.age_range_max || 65,
            gender: brandIdentity.gender || 'all',
            income_level: brandIdentity.income_level || 'medium'
          },
          modelGender: selectedGender,
          count: 10
        }
      });

      if (error) throw error;
      
      const modelsWithNames = data.map((model: any) => ({
        ...model,
        name: generateRandomName(selectedGender),
        gender: selectedGender,
        starred: false,
        archived: false
      }));
      
      setGeneratedModels(modelsWithNames);
      
      toast({
        title: "Success",
        description: "Fashion models have been generated"
      });
    } catch (error) {
      console.error('Error generating fashion models:', error);
      toast({
        title: "Error",
        description: "Failed to generate fashion models",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateRandomName = (gender: string) => {
    const femaleNames = ['Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn'];
    const maleNames = ['Liam', 'Noah', 'Oliver', 'Elijah', 'William', 'James', 'Benjamin', 'Lucas', 'Henry', 'Alexander'];
    
    const names = gender.toLowerCase() === 'female' ? femaleNames : maleNames;
    return names[Math.floor(Math.random() * names.length)];
  };

  const handleStarModel = (model: any) => {
    // Check if adding this model would exceed the limit
    const activeStarredModels = starredModels.filter(m => !m.archived);
    if (activeStarredModels.length >= 3) {
      setIsPlanLimitModalOpen(true);
      return;
    }

    setGeneratedModels(prev => prev.filter(m => m.id !== model.id));
    setStarredModels(prev => [...prev, { ...model, starred: true, archived: false }]);
    
    toast({
      title: "Model starred",
      description: `${model.name} has been added to your starred models`
    });
  };

  const handleToggleModelStatus = (modelId: string, archived: boolean) => {
    setStarredModels(prev => 
      prev.map(model => 
        model.id === modelId ? { ...model, archived } : model
      )
    );
    
    const model = starredModels.find(m => m.id === modelId);
    if (model) {
      toast({
        title: archived ? "Model archived" : "Model activated",
        description: `${model.name} has been ${archived ? 'archived' : 'activated'}`
      });
    }
  };

  const handleImageClick = (model: any) => {
    setSelectedModel(model);
    setIsImageModalOpen(true);
  };

  const handleUpgrade = () => {
    setIsPlanLimitModalOpen(false);
    // Navigate to upgrade page or show upgrade options
    toast({
      title: "Upgrade feature",
      description: "Upgrade functionality would be implemented here"
    });
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
    return null;
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <PageHeader
        title="Fashion Models"
        description="Create and manage fashion models that represent your brand identity"
        icon={<Users className="h-6 w-6" />}
        breadcrumbs={breadcrumbItems}
      />
      
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={60} minSize={40}>
            <div className="h-full overflow-auto p-6 space-y-6">
              <Card className="border-polaris-border shadow-sm">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <UserCircle2 className="h-5 w-5 text-polaris-text-subdued" />
                        <h3 className="text-polaris-text font-medium">Select Gender</h3>
                      </div>
                      <RadioGroup
                        value={selectedGender}
                        onValueChange={setSelectedGender}
                        className="flex items-center space-x-6"
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
                    
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleGenerateModels}
                      disabled={!selectedGender || isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? "Generating Models..." : "Generate Models"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {starredModels.length > 0 && (
                <StarredModelsTable 
                  models={starredModels}
                  onToggleStatus={handleToggleModelStatus}
                  onImageClick={handleImageClick}
                />
              )}
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={40} minSize={30}>
            <FashionModelsPreviewPanel
              models={generatedModels}
              isGenerating={isGenerating}
              onStarModel={handleStarModel}
              onImageClick={handleImageClick}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <ModelImageModal
        model={selectedModel}
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
      />

      <PlanLimitModal
        isOpen={isPlanLimitModalOpen}
        onClose={() => setIsPlanLimitModalOpen(false)}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
};

export default FashionModels;
