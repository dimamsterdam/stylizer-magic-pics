
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ShotSuggestions } from "./PromptSuggestions";

interface ProductView {
  viewName: string;
  variants: string[];
}

interface GeneratedPhoto {
  id: string;
  session_id: string;
  view_name: string;
  variant_index: number;
  image_url: string;
  approval_status: 'pending' | 'approved' | 'rejected';
}

interface PhotoReviewPanelProps {
  productViews: ProductView[];
  generatedPhotos: GeneratedPhoto[];
  isGenerating: boolean;
  hasGeneratedPhotos: boolean;
  onApprovePhoto?: (photoId: string) => void;
  onRejectPhoto?: (photoId: string) => void;
  onUnapprovePhoto?: (photoId: string) => void;
  showShotSuggestions?: boolean;
  productName?: string;
  designBrief?: string;
  onPromptsSelected?: (selectedPrompts: string[]) => void;
}

export const PhotoReviewPanel = ({ 
  productViews, 
  generatedPhotos,
  isGenerating,
  hasGeneratedPhotos,
  onApprovePhoto,
  onRejectPhoto,
  onUnapprovePhoto,
  showShotSuggestions = false,
  productName = '',
  designBrief = '',
  onPromptsSelected
}: PhotoReviewPanelProps) => {
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [currentVariantIndex, setCurrentVariantIndex] = useState(0);
  const { toast } = useToast();

  // Create view groups from generatedPhotos directly
  const viewGroups = React.useMemo(() => {
    console.log('Creating view groups from generatedPhotos:', generatedPhotos);
    
    if (!generatedPhotos || generatedPhotos.length === 0) {
      console.log('No generatedPhotos available');
      return [];
    }
    
    const groups = new Map<string, GeneratedPhoto[]>();
    
    generatedPhotos.forEach(photo => {
      if (!groups.has(photo.view_name)) {
        groups.set(photo.view_name, []);
      }
      groups.get(photo.view_name)!.push(photo);
    });

    const result = Array.from(groups.entries()).map(([viewName, photos]) => ({
      viewName,
      photos: photos.sort((a, b) => a.variant_index - b.variant_index)
    }));
    
    console.log('Created view groups:', result);
    return result;
  }, [generatedPhotos]);

  // Reset view index when viewGroups changes
  React.useEffect(() => {
    if (viewGroups.length > 0 && currentViewIndex >= viewGroups.length) {
      setCurrentViewIndex(0);
      setCurrentVariantIndex(0);
    }
  }, [viewGroups, currentViewIndex]);

  // Debug logging
  React.useEffect(() => {
    console.log('PhotoReviewPanel render state:', {
      viewGroups,
      generatedPhotos,
      hasGeneratedPhotos,
      isGenerating,
      showShotSuggestions,
      currentViewIndex,
      currentVariantIndex
    });
  }, [viewGroups, generatedPhotos, hasGeneratedPhotos, isGenerating, showShotSuggestions, currentViewIndex, currentVariantIndex]);

  const currentViewGroup = viewGroups[currentViewIndex];
  const currentPhoto = currentViewGroup?.photos[currentVariantIndex];
  const isCurrentPhotoApproved = currentPhoto?.approval_status === 'approved';

  // Get approval status for view indicators
  const getViewApprovalStatus = (viewIndex: number) => {
    const viewGroup = viewGroups[viewIndex];
    if (!viewGroup) return 'pending';
    
    const hasApproved = viewGroup.photos.some(photo => photo.approval_status === 'approved');
    return hasApproved ? 'approved' : 'pending';
  };

  const handleApprove = () => {
    if (currentPhoto && onApprovePhoto) {
      onApprovePhoto(currentPhoto.id);
      toast({
        title: "Image approved",
        description: "Photo has been published to Shopify",
      });
    }
  };

  const handleUnapprove = () => {
    if (currentPhoto && onUnapprovePhoto) {
      onUnapprovePhoto(currentPhoto.id);
      toast({
        title: "Approval removed",
        description: "The photo is now pending review again",
      });
    }
  };

  const handleReject = () => {
    if (currentPhoto && onRejectPhoto) {
      onRejectPhoto(currentPhoto.id);
      toast({
        title: "Image rejected",
        description: "This photo has been rejected",
        variant: "destructive"
      });
    }
    
    // Try to move to next variant if available
    if (currentViewGroup && currentVariantIndex < currentViewGroup.photos.length - 1) {
      setCurrentVariantIndex(currentVariantIndex + 1);
    }
  };

  const moveToView = (index: number) => {
    if (index >= 0 && index < viewGroups.length) {
      setCurrentViewIndex(index);
      setCurrentVariantIndex(0);
    }
  };

  const renderContent = () => {
    console.log('Rendering content with conditions:', {
      showShotSuggestions,
      isGenerating,
      hasPhotos: generatedPhotos.length > 0,
      viewGroupsLength: viewGroups.length,
      currentViewGroup
    });

    if (showShotSuggestions && productName && onPromptsSelected) {
      return (
        <div className="p-4">
          <ShotSuggestions
            productName={productName}
            designBrief={designBrief}
            onContinue={onPromptsSelected}
          />
        </div>
      );
    }

    if (isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C6ECB] mb-4"></div>
          <h3 className="text-lg font-medium text-[--p-text] mb-2">Generating your photos</h3>
          <p className="text-[--p-text-subdued] text-center">
            Our AI is creating professional product photos based on your specifications...
          </p>
        </div>
      );
    }

    // Use generatedPhotos length directly instead of hasGeneratedPhotos state
    if (generatedPhotos.length === 0 || viewGroups.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="w-32 h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
            <div className="w-16 h-16 bg-gray-300 rounded"></div>
          </div>
          <h3 className="text-lg font-medium text-[--p-text] mb-2">Generated content will appear here</h3>
          <p className="text-[--p-text-subdued]">
            Select a product and generate photos to preview them in this panel
          </p>
        </div>
      );
    }

    // Show generated photos for review
    if (viewGroups.length > 0 && currentViewGroup && currentPhoto) {
      return (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-[#E3E5E7]">
            <h3 className="font-medium text-[--p-text] mb-1">
              {currentViewGroup.viewName}
            </h3>
            <p className="text-sm text-[--p-text-subdued]">
              {currentViewIndex + 1} of {viewGroups.length} • {isCurrentPhotoApproved ? 'Approved' : 'Pending review'}
            </p>
          </div>

          {/* Variant Switcher - only show if there are multiple variants */}
          {currentViewGroup.photos.length > 1 && (
            <div className="p-4 border-b border-[#E3E5E7]">
              <div className="flex justify-center">
                {currentViewGroup.photos.map((_, index) => (
                  <Button
                    key={index}
                    variant={currentVariantIndex === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentVariantIndex(index)}
                    className={`${index === 0 ? '' : 'rounded-l-none'} ${index === currentViewGroup.photos.length - 1 ? '' : 'rounded-r-none'}`}
                  >
                    Variant {index + 1}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Image Display */}
          <div className="flex-1 p-4">
            <div className="relative">
              <img
                src={currentPhoto.image_url}
                alt={`${currentViewGroup.viewName} variant ${currentVariantIndex + 1}`}
                className="w-full h-auto rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4 border-t border-[#E3E5E7]">
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentViewIndex === 0}
                onClick={() => moveToView(currentViewIndex - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <div className="flex gap-1">
                {viewGroups.map((_, index) => {
                  const status = getViewApprovalStatus(index);
                  return (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        currentViewIndex === index
                          ? 'bg-[#2C6ECB]'
                          : status === 'approved'
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                      onClick={() => moveToView(index)}
                    />
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentViewIndex === viewGroups.length - 1}
                onClick={() => moveToView(currentViewIndex + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {isCurrentPhotoApproved ? (
                <div className="space-y-2">
                  <Button variant="default" className="w-full bg-green-500 hover:bg-green-600 text-white">
                    <Check className="mr-2 h-4 w-4" />
                    Approved
                  </Button>
                  <button 
                    onClick={handleUnapprove}
                    className="w-full text-sm text-[--p-text-subdued] hover:text-[--p-text] underline"
                  >
                    Remove approval
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleReject}
                    className="w-full"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleApprove}
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed right-0 top-[129px] bottom-0 w-[400px] bg-[--p-surface] border-l border-[#E3E5E7] z-10">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-[#E3E5E7]">
          <h2 className="text-lg font-medium text-[--p-text]">Preview</h2>
        </div>
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
