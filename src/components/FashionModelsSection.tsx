
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Plus, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BrandIdentity, ModelDescription } from "@/types/brandTypes";

interface FashionModelsSectionProps {
  brandIdentity: BrandIdentity;
  standalone?: boolean;
}

const ModelCard = ({ model, onApprove, onReject, showActions = true }: { 
  model: ModelDescription; 
  onApprove?: () => void; 
  onReject?: () => void;
  showActions?: boolean;
}) => {
  return (
    <div className={`relative rounded-md overflow-hidden shadow-md ${model.approved ? 'flip-container flipped' : 'flip-container'}`}>
      <div className="flipper">
        <div className="flip-front bg-white">
          {model.imageUrl ? (
            <img src={model.imageUrl} alt="Model" className="w-full h-48 object-cover" />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <Users className="h-12 w-12 text-gray-400" />
              <span className="sr-only">No image available</span>
            </div>
          )}
          <div className="p-4">
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
            {showActions && model.approved && (
              <div className="mt-3">
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Approved
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flip-back bg-white">
          {model.imageUrl ? (
            <div className="relative">
              <img src={model.imageUrl} alt="Model" className="w-full h-48 object-cover opacity-90" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="transform rotate-45 bg-green-500 text-white font-bold py-2 px-8 text-lg opacity-90">
                  APPROVED
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-green-500 text-white text-center py-1 text-sm font-bold opacity-90">
                BRAND FACE
              </div>
            </div>
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <Users className="h-12 w-12 text-gray-400" />
              <span className="sr-only">No image available</span>
            </div>
          )}
          <div className="p-4">
            <p className="text-sm text-polaris-text">{model.description}</p>
            {showActions && (
              <div className="mt-3">
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Approved Brand Face
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FashionModelsSection = ({ brandIdentity, standalone = false }: FashionModelsSectionProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error("No authenticated user");
      }

      const { data, error } = await supabase.functions.invoke('generate-fashion-models', {
        body: { 
          brandName: brandIdentity.brand_name,
          values: brandIdentity.values,
          characteristics: brandIdentity.characteristics,
          age_range_min: brandIdentity.age_range_min,
          age_range_max: brandIdentity.age_range_max,
          gender: brandIdentity.gender,
          income_level: brandIdentity.income_level
        }
      });

      if (error) throw error;
      console.log("Models generated:", data);

      // Update the brand_identity record with the generated models
      const { error: updateError } = await supabase
        .from('brand_identity')
        .update({
          brand_models: data
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
    },
    onError: (error) => {
      console.error('Error generating fashion models:', error);
      toast({
        title: "Error",
        description: "Failed to generate fashion models",
        variant: "destructive"
      });
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

  const handleGenerateModels = () => {
    generateMutation.mutate();
  };

  const approvedModels = brandIdentity.brand_models?.filter(model => model.approved) || [];
  const unapprovedModels = brandIdentity.brand_models?.filter(model => !model.approved) || [];

  return (
    <div id="fashion-models-section">
      <div className="flex items-center justify-between mb-4">
        {!standalone && (
          <div className="flex items-center gap-2 text-xl font-semibold text-polaris-text">
            <Users className="h-6 w-6" />
            <h2>Fashion Models</h2>
          </div>
        )}
        <Button
          variant="default"
          onClick={handleGenerateModels}
          disabled={generateMutation.isPending}
        >
          {generateMutation.isPending ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Generating...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              {brandIdentity.brand_models?.length ? "Regenerate Models" : "Generate Models"}
            </>
          )}
        </Button>
      </div>

      {approvedModels.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3">Approved Models</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {approvedModels.map(model => (
              <ModelCard 
                key={model.id} 
                model={model} 
                showActions={false}
              />
            ))}
          </div>
        </div>
      )}

      {unapprovedModels.length > 0 && (
        <>
          <h3 className="text-lg font-medium mb-3">Pending Models</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unapprovedModels.map(model => (
              <ModelCard 
                key={model.id} 
                model={model} 
                onApprove={() => approveModelMutation.mutate(model.id)}
                onReject={() => rejectModelMutation.mutate(model.id)}
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
              {brandIdentity.brand_models?.map(model => (
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
