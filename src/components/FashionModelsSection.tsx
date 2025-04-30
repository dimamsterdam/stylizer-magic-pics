
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader, Plus, AlertCircle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ModelDescription, BrandIdentity } from "@/types/brandTypes";
import { Json } from "@/integrations/supabase/types";

interface FashionModelsSectionProps {
  brandIdentity: BrandIdentity;
  onModelsUpdated?: () => void;
}

const FashionModelsSection: React.FC<FashionModelsSectionProps> = ({ brandIdentity, onModelsUpdated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedModels, setGeneratedModels] = useState<ModelDescription[]>(
    Array.isArray(brandIdentity.brand_models) ? brandIdentity.brand_models : []
  );
  const [approvedModels, setApprovedModels] = useState<ModelDescription[]>(
    Array.isArray(brandIdentity.brand_models) ? brandIdentity.brand_models.filter(model => model.approved) : []
  );
  const [isRegeneratingImage, setIsRegeneratingImage] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (models: ModelDescription[]) => {
      if (!brandIdentity.id) {
        throw new Error("Brand identity ID is required");
      }

      // When saving to Supabase, we need to ensure the models are properly serializable
      const serializedModels = models.map(model => ({
        id: model.id,
        description: model.description,
        imageUrl: model.imageUrl,
        approved: model.approved
      }));

      const { error } = await supabase
        .from('brand_identity')
        .update({ brand_models: serializedModels })
        .eq('id', brandIdentity.id);

      if (error) throw error;
      return models;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brandIdentity'] });
      toast({
        title: "Success",
        description: "Fashion models updated successfully"
      });
      if (onModelsUpdated) onModelsUpdated();
    },
    onError: (error) => {
      console.error('Error saving models:', error);
      toast({
        title: "Error",
        description: "Failed to save fashion models",
        variant: "destructive"
      });
    }
  });

  const generateModels = async () => {
    if (!brandIdentity) {
      toast({
        title: "Error",
        description: "Brand identity data is required",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const regenerateIds = generatedModels
        .filter(model => !model.approved)
        .map(model => model.id);

      console.log("Calling generate-fashion-models with:", { 
        brandIdentity, 
        regenerateIds, 
        count: 10 - approvedModels.length 
      });

      const { data, error } = await supabase.functions.invoke('generate-fashion-models', {
        body: { 
          brandIdentity,
          regenerate: regenerateIds,
          count: 10 - approvedModels.length
        }
      });

      if (error) throw error;
      console.log("Generated models data:", data);
      
      // Ensure generated models have the correct type
      const typedModels = data.map((model: any) => model as ModelDescription);
      
      // Keep approved models and add new ones
      const currentApproved = generatedModels.filter(model => model.approved);
      setGeneratedModels([...currentApproved, ...typedModels]);
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

  const regenerateModelImage = async (model: ModelDescription) => {
    if (!model.description) {
      toast({
        title: "Error",
        description: "Model description is required to regenerate image",
        variant: "destructive"
      });
      return;
    }

    setIsRegeneratingImage(model.id);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-image', {
        body: { 
          prompt: `Professional headshot photo of a fashion model. ${model.description}. Clean neutral background, soft flattering lighting, professional fashion photography style.`,
          size: "1024x1024",
          model: "dall-e-3"
        }
      });

      if (error) throw error;
      
      if (data && data.url) {
        // Update the model with new image URL
        const updatedModel = { ...model, imageUrl: data.url };
        
        // Update in generatedModels
        const updatedGeneratedModels = generatedModels.map(m => 
          m.id === model.id ? updatedModel : m
        );
        setGeneratedModels(updatedGeneratedModels);
        
        // Update in approvedModels if applicable
        if (model.approved) {
          const updatedApprovedModels = approvedModels.map(m => 
            m.id === model.id ? updatedModel : m
          );
          setApprovedModels(updatedApprovedModels);
          saveMutation.mutate(updatedApprovedModels);
        }
        
        toast({
          title: "Success",
          description: "Model image regenerated successfully"
        });
      } else {
        throw new Error("No image URL returned");
      }
    } catch (error) {
      console.error('Error regenerating model image:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate model image",
        variant: "destructive"
      });
    } finally {
      setIsRegeneratingImage(null);
    }
  };

  const handleApproveModel = (model: ModelDescription) => {
    const updatedModels = generatedModels.map(m => 
      m.id === model.id ? { ...m, approved: true } : m
    );
    
    setGeneratedModels(updatedModels);
    
    const newApprovedModels = [...approvedModels, { ...model, approved: true }];
    setApprovedModels(newApprovedModels);
    
    saveMutation.mutate(newApprovedModels);
  };

  const handleRejectModel = (model: ModelDescription) => {
    const updatedModels = generatedModels.filter(m => m.id !== model.id);
    setGeneratedModels(updatedModels);
  };

  const handleRemoveApprovedModel = (model: ModelDescription) => {
    const updatedApprovedModels = approvedModels.filter(m => m.id !== model.id);
    setApprovedModels(updatedApprovedModels);
    saveMutation.mutate(updatedApprovedModels);
  };

  // Handle image errors by using a placeholder
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = '/placeholder.svg';
  };

  // Function to determine if a model needs image regeneration
  const needsImageRegeneration = (model: ModelDescription) => {
    return !model.imageUrl || model.imageUrl === 'null' || model.imageUrl === '';
  };

  // Function to render model description
  const renderModelDescription = (description: string) => {
    if (!description || description === "Error generating description") {
      return (
        <p className="text-sm text-polaris-secondary italic">No description available</p>
      );
    }
    return (
      <p className="text-sm line-clamp-3 text-polaris-text">{description}</p>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-polaris-text">Fashion Models</h2>
          <p className="text-polaris-secondary mt-1">Create and manage models that represent your brand identity</p>
        </div>
        <Button 
          onClick={generateModels} 
          disabled={isGenerating || (generatedModels.length - approvedModels.length) >= 10}
        >
          {isGenerating ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Generate Models
        </Button>
      </div>

      {/* Generated Models */}
      {(generatedModels.length > 0 || isGenerating) && (
        <div className="space-y-4">
          <h3 className="font-medium text-lg text-polaris-text">Generated Models</h3>
          
          {isGenerating && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={`skeleton-${i}`} className="overflow-hidden flex flex-col">
                  <Skeleton className="w-full aspect-square" />
                  <div className="p-3">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex justify-between mt-4">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!isGenerating && generatedModels.filter(m => !m.approved).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {generatedModels
                .filter(model => !model.approved)
                .map((model) => (
                  <Card key={model.id} className="overflow-hidden flex flex-col">
                    <div className="relative aspect-square">
                      {model.imageUrl ? (
                        <>
                          <img 
                            src={model.imageUrl} 
                            alt={model.description}
                            className="w-full h-full object-cover" 
                            onError={handleImageError}
                          />
                          {isRegeneratingImage === model.id && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <Loader className="animate-spin text-white w-8 h-8" />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                          <div className="text-center p-4">
                            <AlertCircle className="mx-auto h-8 w-8 text-amber-500 mb-2" />
                            <p className="text-sm text-gray-500">Image not available</p>
                            <Button 
                              onClick={() => regenerateModelImage(model)}
                              size="sm"
                              variant="outline"
                              className="mt-2"
                              disabled={isRegeneratingImage === model.id}
                            >
                              {isRegeneratingImage === model.id ? (
                                <Loader className="h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4 mr-1" />
                              )}
                              Regenerate
                            </Button>
                          </div>
                        </div>
                      )}
                      {model.imageUrl && needsImageRegeneration(model) && !isRegeneratingImage && (
                        <Button
                          size="icon"
                          variant="outline"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white"
                          onClick={() => regenerateModelImage(model)}
                          disabled={isRegeneratingImage === model.id}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="p-3">
                      {renderModelDescription(model.description)}
                      <div className="flex justify-between mt-3">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-8 w-8 rounded-full bg-green-50 hover:bg-green-100 border-green-200"
                          onClick={() => handleApproveModel(model)}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline"
                          className="h-8 w-8 rounded-full bg-red-50 hover:bg-red-100 border-red-200"
                          onClick={() => handleRejectModel(model)}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Approved Models */}
      {approvedModels.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-lg text-polaris-text">Faces of the Brand</h3>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {approvedModels.length} {approvedModels.length === 1 ? 'model' : 'models'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {approvedModels.map((model) => (
              <Card key={model.id} className="overflow-hidden flex flex-col">
                <div className="relative aspect-square">
                  {model.imageUrl ? (
                    <>
                      <img 
                        src={model.imageUrl} 
                        alt={model.description}
                        className="w-full h-full object-cover" 
                        onError={handleImageError}
                      />
                      {isRegeneratingImage === model.id && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <Loader className="animate-spin text-white w-8 h-8" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                      <div className="text-center p-4">
                        <AlertCircle className="mx-auto h-8 w-8 text-amber-500 mb-2" />
                        <p className="text-sm text-gray-500">Image not available</p>
                        <Button 
                          onClick={() => regenerateModelImage(model)}
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          disabled={isRegeneratingImage === model.id}
                        >
                          {isRegeneratingImage === model.id ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-1" />
                          )}
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  )}
                  {model.imageUrl && (
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white opacity-0 hover:opacity-100 transition-opacity"
                      onClick={() => regenerateModelImage(model)}
                      disabled={isRegeneratingImage === model.id}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="p-3">
                  {renderModelDescription(model.description)}
                  <div className="flex justify-end mt-3">
                    <Button 
                      size="icon" 
                      variant="outline"
                      className="h-8 w-8 rounded-full bg-red-50 hover:bg-red-100 border-red-200"
                      onClick={() => handleRemoveApprovedModel(model)}
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {generatedModels.length === 0 && approvedModels.length === 0 && !isGenerating && (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <p className="text-polaris-secondary mb-4">No fashion models have been generated yet</p>
          <Button onClick={generateModels}>Generate Fashion Models</Button>
        </div>
      )}
    </div>
  );
};

export default FashionModelsSection;
