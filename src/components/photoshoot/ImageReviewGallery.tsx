
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Check, X, ArrowLeft, ArrowRight, View } from "lucide-react";

interface ProductView {
  viewName: string;
  variants: string[];
}

interface ImageReviewGalleryProps {
  productViews: ProductView[];
}

export const ImageReviewGallery = ({ productViews }: ImageReviewGalleryProps) => {
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [currentVariantIndex, setCurrentVariantIndex] = useState(0);
  const [reviewedViews, setReviewedViews] = useState<Set<number>>(new Set());
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { toast } = useToast();

  const currentView = productViews[currentViewIndex];
  const isLastView = currentViewIndex === productViews.length - 1;
  const allReviewed = reviewedViews.size === productViews.length;

  const toggleVariant = () => {
    setCurrentVariantIndex(prev => (prev === 0 ? 1 : 0));
  };

  const handleApprove = () => {
    // Mark the current view as reviewed
    setReviewedViews(prev => new Set([...prev, currentViewIndex]));
    
    toast({
      title: "Image approved",
      description: "Photo has been published to Shopify",
    });
    
    // Move to next view if available
    if (!isLastView) {
      setTimeout(() => {
        setCurrentViewIndex(prev => prev + 1);
        setCurrentVariantIndex(0);
      }, 1000);
    }
  };

  const handleReject = () => {
    // Show the alternative variant
    setCurrentVariantIndex(prev => (prev === 0 ? 1 : 0));
    
    toast({
      description: "Showing alternative photo",
    });
  };

  const moveToView = (index: number) => {
    if (index >= 0 && index < productViews.length) {
      setCurrentViewIndex(index);
      setCurrentVariantIndex(0);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(prev => !prev);
  };

  return (
    <div className={`relative ${isFullScreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      <div className={`${isFullScreen ? 'flex flex-col h-full' : ''}`}>
        {/* Header */}
        <div className={`flex justify-between items-center mb-4 p-4 ${isFullScreen ? 'bg-black text-white' : ''}`}>
          <div>
            <h2 className={`text-xl font-medium ${isFullScreen ? 'text-white' : 'text-[--p-text]'}`}>
              {currentView.viewName} ({currentViewIndex + 1}/{productViews.length})
            </h2>
            <p className={`text-sm ${isFullScreen ? 'text-gray-300' : 'text-[--p-text-subdued]'}`}>
              {reviewedViews.has(currentViewIndex) ? 'Approved' : 'Pending review'}
            </p>
          </div>
          <Button
            variant={isFullScreen ? "outline" : "secondary"}
            onClick={toggleFullScreen}
            className={isFullScreen ? "bg-transparent text-white border-white" : ""}
          >
            <View className="mr-2 h-4 w-4" />
            {isFullScreen ? "Exit Full Screen" : "Full Screen"}
          </Button>
        </div>
        
        {/* Main Image Display */}
        <div className={`flex-1 ${isFullScreen ? 'flex items-center justify-center' : ''}`}>
          <div className={`relative ${isFullScreen ? 'h-full max-h-[80vh] w-full max-w-[90vw] mx-auto' : 'aspect-square'}`}>
            <img
              src={currentView.variants[currentVariantIndex]}
              alt={`${currentView.viewName} variant ${currentVariantIndex + 1}`}
              className={`w-full h-full object-contain ${isFullScreen ? 'max-h-[80vh]' : ''}`}
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>
        </div>
        
        {/* Controls */}
        <div className={`flex flex-col gap-4 mt-4 ${isFullScreen ? 'p-4 bg-black' : ''}`}>
          {/* Variant Switcher */}
          <div className="flex justify-center mb-2">
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
          
          {/* Navigation */}
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant="outline"
              disabled={currentViewIndex === 0}
              onClick={() => moveToView(currentViewIndex - 1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            {allReviewed ? (
              <Button variant="success">
                All Photos Reviewed
              </Button>
            ) : reviewedViews.has(currentViewIndex) ? (
              <Button variant="outline" disabled>
                Already Approved
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleApprove}
              >
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>
            )}
            
            <div className="flex justify-end">
              {reviewedViews.has(currentViewIndex) || isLastView ? (
                <Button
                  variant="outline"
                  disabled={isLastView && reviewedViews.has(currentViewIndex)}
                  onClick={() => moveToView(currentViewIndex + 1)}
                >
                  {isLastView ? 'Finish' : 'Next'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleReject}
                >
                  <X className="mr-2 h-4 w-4" />
                  Try Alternative
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Thumbnails/Progress */}
        <div className={`mt-6 ${isFullScreen ? 'p-4 bg-black' : ''}`}>
          <div className="flex justify-center gap-2">
            {productViews.map((view, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full ${
                  currentViewIndex === index
                    ? 'bg-[#2C6ECB]'
                    : reviewedViews.has(index)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
                onClick={() => moveToView(index)}
                aria-label={`Go to ${view.viewName}`}
              />
            ))}
          </div>
        </div>
        
        {/* Complete Message */}
        {allReviewed && (
          <div className="mt-4 text-center">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-medium text-green-600 mb-2">All Done!</h3>
                <p className="text-[--p-text-subdued]">No more images to review. Your photos have been published to Shopify.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
