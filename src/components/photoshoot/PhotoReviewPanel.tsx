
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  title: string;
  sku: string;
  image: string;
}

interface ProductView {
  viewName: string;
  variants: string[];
}

interface PhotoReviewPanelProps {
  selectedProduct?: Product;
  productViews: ProductView[];
  isGenerating: boolean;
  hasGeneratedPhotos: boolean;
}

export const PhotoReviewPanel = ({ 
  selectedProduct, 
  productViews, 
  isGenerating,
  hasGeneratedPhotos 
}: PhotoReviewPanelProps) => {
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [currentVariantIndex, setCurrentVariantIndex] = useState(0);
  const [reviewedViews, setReviewedViews] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const currentView = productViews[currentViewIndex];
  const isCurrentViewReviewed = reviewedViews.has(currentViewIndex);

  const handleApprove = () => {
    setReviewedViews(prev => new Set([...prev, currentViewIndex]));
    toast({
      title: "Image approved",
      description: "Photo has been published to Shopify",
    });
  };

  const handleUnapprove = () => {
    const newReviewed = new Set(reviewedViews);
    newReviewed.delete(currentViewIndex);
    setReviewedViews(newReviewed);
    toast({
      title: "Approval removed",
      description: "The photo is now pending review again",
    });
  };

  const handleReject = () => {
    toast({
      title: "Image rejected",
      description: "This photo has been rejected",
      variant: "destructive"
    });
    
    if (currentVariantIndex === 0) {
      setCurrentVariantIndex(1);
    }
  };

  const moveToView = (index: number) => {
    if (index >= 0 && index < productViews.length) {
      setCurrentViewIndex(index);
      setCurrentVariantIndex(0);
    }
  };

  const renderContent = () => {
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

    if (!hasGeneratedPhotos && selectedProduct) {
      return (
        <div className="p-6">
          <h3 className="text-lg font-medium text-[--p-text] mb-4">Selected Product</h3>
          <div className="space-y-4">
            <img 
              src={selectedProduct.image} 
              alt={selectedProduct.title} 
              className="w-full h-auto rounded-lg"
              onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} 
            />
            <div>
              <h4 className="font-medium text-[--p-text]">{selectedProduct.title}</h4>
              <p className="text-sm text-[--p-text-subdued]">SKU: {selectedProduct.sku}</p>
            </div>
          </div>
        </div>
      );
    }

    if (hasGeneratedPhotos && currentView) {
      return (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-[#E3E5E7]">
            <h3 className="font-medium text-[--p-text] mb-1">
              {currentView.viewName}
            </h3>
            <p className="text-sm text-[--p-text-subdued]">
              {currentViewIndex + 1} of {productViews.length} • {isCurrentViewReviewed ? 'Approved' : 'Pending review'}
            </p>
          </div>

          {/* Variant Switcher */}
          <div className="p-4 border-b border-[#E3E5E7]">
            <div className="flex justify-center">
              <Button
                variant={currentVariantIndex === 0 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentVariantIndex(0)}
                className="rounded-r-none"
              >
                Variant 1
              </Button>
              <Button
                variant={currentVariantIndex === 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentVariantIndex(1)}
                className="rounded-l-none"
              >
                Variant 2
              </Button>
            </div>
          </div>

          {/* Image Display */}
          <div className="flex-1 p-4">
            <div className="relative">
              <img
                src={currentView.variants[currentVariantIndex]}
                alt={`${currentView.viewName} variant ${currentVariantIndex + 1}`}
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
                {productViews.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      currentViewIndex === index
                        ? 'bg-[#2C6ECB]'
                        : reviewedViews.has(index)
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                    onClick={() => moveToView(index)}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentViewIndex === productViews.length - 1}
                onClick={() => moveToView(currentViewIndex + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {isCurrentViewReviewed ? (
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

    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-[--p-text-subdued] text-center">
          Select a product and generate photos to preview them here
        </p>
      </div>
    );
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
