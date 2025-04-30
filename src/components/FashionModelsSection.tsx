import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ModelDescription, BrandIdentity } from "@/types/brandTypes";

interface FashionModelsSectionProps {
  brandIdentity: BrandIdentity;
  onModelsUpdated?: () => void;
}

const FashionModelsSection: React.FC<FashionModelsSectionProps> = ({ brandIdentity, onModelsUpdated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedModels, setGeneratedModels] = useState<ModelDescription[]>([]);
  const [approvedModels, setApprovedModels] = useState<ModelDescription[]>(
    Array.isArray(brandIdentity.brand_models) ? brandIdentity.brand_models : []
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (models: ModelDescription[]) => {
      if (!brandIdentity.id) {
        throw new Error("Brand identity ID is required");
      }

      const { error } = await supabase
        .from('brand_identity')
        .update({ brand_models: models })
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

      const { data, error } = await supabase.functions.invoke('generate-fashion-models', {
        body: { 
          brandIdentity,
          regenerate: regenerateIds,
          count: 10 - approvedModels.length
        }
      });

      if (error) throw error;
      
      // Keep approved models and add new ones
      const currentApproved = generatedModels.filter(model => model.approved);
      setGeneratedModels([...currentApproved, ...data]);
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
                    {model.imageUrl ? (
                      <div className="relative aspect-square">
                        <img 
                          src={model.imageUrl} 
                          alt={model.description}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-200 w-full aspect-square flex items-center justify-center">
                        <p className="text-sm text-gray-500">Image not available</p>
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-sm line-clamp-3 text-polaris-text">{model.description}</p>
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
                {model.imageUrl ? (
                  <div className="relative aspect-square">
                    <img 
                      src={model.imageUrl} 
                      alt={model.description}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ) : (
                  <div className="bg-gray-200 w-full aspect-square flex items-center justify-center">
                    <p className="text-sm text-gray-500">Image not available</p>
                  </div>
                )}
                <div className="p-3">
                  <p className="text-sm line-clamp-3 text-polaris-text">{model.description}</p>
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
