import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Check, X, Trash2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BrandIdentity, ModelDescription } from "@/types/brandTypes";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FashionModelsSectionProps {
  brandIdentity: BrandIdentity;
  standalone?: boolean;
  initialGenderFilter?: string;
  initialRaceFilter?: string;
  isGenerateTriggered?: boolean;
  onGenerateComplete?: () => void;
}

interface ModelCardProps {
  model: ModelDescription;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete?: () => void;
  onCustomize?: () => void;
  showActions?: boolean;
}

const ModelCard: React.FC<ModelCardProps> = ({
  model,
  onApprove,
  onReject,
  onDelete,
  onCustomize,
  showActions = true
}) => {
  return (
    <Card className="overflow-hidden">
      <div className={model.approved ? 'flip-container flipped' : 'flip-container'}>
        <div className="flipper">
          <div className="flip-front bg-white">
            {model.imageUrl ? (
              <div className="relative">
                <img src={model.imageUrl} alt="Model" className="w-full h-48 object-cover" />
                {model.approved && (
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="default"
                            size="icon"
                            className="w-8 h-8 rounded-full bg-white/80 text-gray-700 hover:bg-white hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onDelete) onDelete();
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove model</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Remove model</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="default"
                                size="icon"
                                className="w-8 h-8 rounded-full bg-white/80 text-gray-700 hover:bg-white hover:text-blue-500"
                              >
                                <Wand2 className="h-4 w-4" />
                                <span className="sr-only">Customize model</span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-4">
                                <h4 className="font-medium text-sm">Customize model prompt</h4>
                                <textarea
                                  className="w-full min-h-[100px] p-2 border border-gray-300 rounded-md"
                                  placeholder="Add specific details to customize this model..."
                                  defaultValue={model.description}
                                ></textarea>
                                <div className="flex justify-end">
                                  <Button size="sm" onClick={() => onCustomize && onCustomize()}>
                                    Apply Changes
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Customize with prompt</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <Users className="h-12 w-12 text-gray-400" />
                <span className="sr-only">No image available</span>
              </div>
            )}
            <CardContent className="p-4">
              <p className="text-sm text-polaris-text">{model.description}</p>
              {showActions && !model.approved && (
                <div className="flex justify-end mt-3 space-x-2">
                  <Button variant="outline" size="sm" className="text-red-500" onClick={onReject}>
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button variant="outline" size="sm" className="text-green-500" onClick={onApprove}>
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                </div>
              )}
            </CardContent>
          </div>
          <div className="flip-back bg-white">
            {model.imageUrl ? (
              <div className="relative">
                <img src={model.imageUrl} alt="Model" className="w-full h-48 object-cover opacity-90" />
                <div className="absolute top-2 right-2 flex space-x-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="default"
                          size="icon"
                          className="w-8 h-8 rounded-full bg-white/80 text-gray-700 hover:bg-white hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onDelete) onDelete();
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove model</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Remove model</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="default"
                              size="icon"
                              className="w-8 h-8 rounded-full bg-white/80 text-gray-700 hover:bg-white hover:text-blue-500"
                            >
                              <Wand2 className="h-4 w-4" />
                              <span className="sr-only">Customize model</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-4">
                              <h4 className="font-medium text-sm">Customize model prompt</h4>
                              <textarea
                                className="w-full min-h-[100px] p-2 border border-gray-300 rounded-md"
                                placeholder="Add specific details to customize this model..."
                                defaultValue={model.description}
                              ></textarea>
                              <div className="flex justify-end">
                                <Button size="sm" onClick={() => onCustomize && onCustomize()}>
                                  Apply Changes
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Customize with prompt</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <Users className="h-12 w-12 text-gray-400" />
                <span className="sr-only">No image available</span>
              </div>
            )}
            <CardContent className="p-4">
              <p className="text-sm text-polaris-text">{model.description}</p>
              {showActions && (
                <div className="mt-3">
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    Face of the brand
                  </div>
                </div>
              )}
            </CardContent>
          </div>
        </div>
      </div>
    </Card>
  );
};

const FashionModelsSection = ({
  brandIdentity,
  standalone = false,
  initialGenderFilter = "Female",
  initialRaceFilter = "any",
  isGenerateTriggered = false,
  onGenerateComplete
}: FashionModelsSectionProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [genderFilter, setGenderFilter] = useState<string>(initialGenderFilter);
  const [raceFilter, setRaceFilter] = useState<string>(initialRaceFilter);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update local filters when props change
  useEffect(() => {
    setGenderFilter(initialGenderFilter);
    setRaceFilter(initialRaceFilter);
  }, [initialGenderFilter, initialRaceFilter]);

  // Trigger generation when the parent signals
  useEffect(() => {
    if (isGenerateTriggered) {
      generateMutation.mutate();
    }
  }, [isGenerateTriggered]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error("No authenticated user");
      }

      console.log("Invoking generate-fashion-models with:", {
        brandIdentity,
        modelGender: genderFilter,
        modelRace: raceFilter !== "any" ? raceFilter : undefined
      });

      const { data, error } = await supabase.functions.invoke('generate-fashion-models', {
        body: {
          brandIdentity: {
            brand_name: brandIdentity.brand_name,
            values: brandIdentity.values,
            characteristics: brandIdentity.characteristics,
            age_range_min: brandIdentity.age_range_min,
            age_range_max: brandIdentity.age_range_max,
            gender: brandIdentity.gender,
            income_level: brandIdentity.income_level
          },
          modelGender: genderFilter,
          modelRace: raceFilter !== "any" ? raceFilter : undefined
        }
      });

      if (error) throw error;
      console.log("Models generated:", data);

      // Append to existing models instead of replacing
      const existingModels = brandIdentity.brand_models || [];
      const allModels = [...existingModels, ...data];

      // Update the brand_identity record with the appended models
      const { error: updateError } = await supabase
        .from('brand_identity')
        .update({
          brand_models: allModels
        })
        .eq('id', brandIdentity.id);

      if (updateError) throw updateError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brandIdentity'] });
      toast({
        title: "Success",
        description: "Fashion models have been generated"
      });
      setIsDialogOpen(true);
      if (onGenerateComplete) onGenerateComplete();
    },
    onError: (error) => {
      console.error('Error generating fashion models:', error);
      toast({
        title: "Error",
        description: "Failed to generate fashion models",
        variant: "destructive"
      });
      if (onGenerateComplete) onGenerateComplete();
    }
  });

  const approveModelMutation = useMutation({
    mutationFn: async (modelId: string) => {
      // Get the current models
      const currentModels = [...(brandIdentity.brand_models || [])];

      // Find the model to approve
      const modelIndex = currentModels.findIndex(model => model.id === modelId);
      if (modelIndex >= 0) {
        currentModels[modelIndex].approved = true;
      }

      // Update the database
      const { error } = await supabase
        .from('brand_identity')
        .update({
          brand_models: currentModels
        })
        .eq('id', brandIdentity.id);

      if (error) throw error;
      return currentModels;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brandIdentity'] });
    },
    onError: (error) => {
      console.error('Error approving model:', error);
      toast({
        title: "Error",
        description: "Failed to approve model",
        variant: "destructive"
      });
    }
  });

  const deleteModelMutation = useMutation({
    mutationFn: async (modelId: string) => {
      // Get the current models
      const currentModels = [...(brandIdentity.brand_models || [])];

      // Filter out the deleted model
      const updatedModels = currentModels.filter(model => model.id !== modelId);

      // Update the database
      const { error } = await supabase
        .from('brand_identity')
        .update({
          brand_models: updatedModels
        })
        .eq('id', brandIdentity.id);

      if (error) throw error;
      return updatedModels;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brandIdentity'] });
      toast({
        title: "Success",
        description: "Model has been removed"
      });
    },
    onError: (error) => {
      console.error('Error deleting model:', error);
      toast({
        title: "Error",
        description: "Failed to delete model",
        variant: "destructive"
      });
    }
  });

  const rejectModelMutation = useMutation({
    mutationFn: async (modelId: string) => {
      // Get the current models
      const currentModels = [...(brandIdentity.brand_models || [])];

      // Filter out the rejected model
      const updatedModels = currentModels.filter(model => model.id !== modelId);

      // Update the database
      const { error } = await supabase
        .from('brand_identity')
        .update({
          brand_models: updatedModels
        })
        .eq('id', brandIdentity.id);

      if (error) throw error;
      return updatedModels;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brandIdentity'] });
    },
    onError: (error) => {
      console.error('Error rejecting model:', error);
      toast({
        title: "Error",
        description: "Failed to reject model",
        variant: "destructive"
      });
    }
  });

  const approvedModels = brandIdentity.brand_models?.filter(model => model.approved) || [];
  const pendingModels = brandIdentity.brand_models?.filter(model => !model.approved) || [];

  return (
    <div id="fashion-models-section">
      {approvedModels.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-3 text-polaris-text">Faces of the brand</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {approvedModels.map(model => (
              <ModelCard
                key={model.id}
                model={model}
                onDelete={() => deleteModelMutation.mutate(model.id)}
                onCustomize={() => { }}
                showActions={true}
              />
            ))}
          </div>
        </div>
      )}

      {pendingModels.length > 0 && (
        <>
          <h3 className="text-lg font-medium mb-3 text-polaris-text">Pending Models</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {pendingModels.map(model => (
              <ModelCard
                key={model.id}
                model={model}
                onApprove={() => approveModelMutation.mutate(model.id)}
                onReject={() => rejectModelMutation.mutate(model.id)}
                showActions={true}
              />
            ))}
          </div>
        </>
      )}

      {!brandIdentity.brand_models?.length && (
        <div className="bg-polaris-background rounded-lg p-6 text-center">
          <Users className="mx-auto h-12 w-12 text-polaris-secondary mb-3" />
          <h3 className="font-medium text-lg mb-2">No Fashion Models Yet</h3>
          <p className="text-polaris-secondary mb-4">
            Generate fashion models based on your brand identity to represent your products
          </p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Fashion Models</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              We've generated fashion models based on your brand identity. Review and approve the ones that best represent your brand.
            </p>
            <div className="max-h-[60vh] overflow-y-auto space-y-4">
              {pendingModels.map(model => (
                <div key={model.id} className="border rounded-md p-4">
                  <ModelCard
                    model={model}
                    onApprove={() => approveModelMutation.mutate(model.id)}
                    onReject={() => rejectModelMutation.mutate(model.id)}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FashionModelsSection;
