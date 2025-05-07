
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Check, X, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [animationDirection, setAnimationDirection] = useState<'from-right' | 'from-left' | null>(null);
  const { toast } = useToast();

  const currentView = productViews[currentViewIndex];
  const isLastView = currentViewIndex === productViews.length - 1;
  const allReviewed = reviewedViews.size === productViews.length;
  const isCurrentViewReviewed = reviewedViews.has(currentViewIndex);

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
        setAnimationDirection('from-right');
        setCurrentViewIndex(prev => prev + 1);
        setCurrentVariantIndex(0);
      }, 1000);
    }
  };

  const handleUnapprove = () => {
    // Remove from reviewed
    const newReviewed = new Set(reviewedViews);
    newReviewed.delete(currentViewIndex);
    setReviewedViews(newReviewed);
    
    toast({
      title: "Approval removed",
      description: "The photo is now pending review again",
    });
  };

  const handleReject = () => {
    // Show rejection toast
    toast({
      title: "Image rejected",
      description: "This photo has been rejected",
      variant: "destructive"
    });
    
    // Move to next view if available
    if (!isLastView) {
      setTimeout(() => {
        setAnimationDirection('from-right');
        setCurrentViewIndex(prev => prev + 1);
        setCurrentVariantIndex(0);
      }, 1000);
    } else {
      // If it's the last view, just mark it as reviewed
      setReviewedViews(prev => new Set([...prev, currentViewIndex]));
    }
  };

  const moveToView = (index: number) => {
    if (index >= 0 && index < productViews.length) {
      // Set animation direction
      setAnimationDirection(index > currentViewIndex ? 'from-right' : 'from-left');
      setCurrentViewIndex(index);
      setCurrentVariantIndex(0);
    }
  };

  // Reset animation after it completes
  useEffect(() => {
    if (animationDirection) {
      const timer = setTimeout(() => {
        setAnimationDirection(null);
      }, 500); // Duration should match the CSS animation duration
      return () => clearTimeout(timer);
    }
  }, [animationDirection]);

  return (
    <div className="relative">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-4 p-4">
          <div>
            <h2 className="text-xl font-medium text-[--p-text]">
              {currentView.viewName} ({currentViewIndex + 1}/{productViews.length})
            </h2>
            <p className="text-sm text-[--p-text-subdued]">
              {reviewedViews.has(currentViewIndex) ? 'Approved' : 'Pending review'}
            </p>
          </div>
        </div>
        
        {/* Variant Switcher - Moved above the image */}
        <div className="flex justify-center mb-4">
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
        
        {/* Main Image Display */}
        <div className="flex-1">
          <div className="relative aspect-square overflow-hidden">
            <img
              src={currentView.variants[currentVariantIndex]}
              alt={`${currentView.viewName} variant ${currentVariantIndex + 1}`}
              className={cn(
                "w-full h-full object-contain transition-transform duration-500",
                animationDirection === 'from-right' && "animate-slide-in-right",
                animationDirection === 'from-left' && "animate-slide-in-left"
              )}
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col gap-4 mt-4">
          {/* Navigation */}
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant="outline"
              disabled={currentViewIndex === 0}
              onClick={() => moveToView(currentViewIndex - 1)}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            {allReviewed ? (
              <Button variant="success" className="w-full">
                <Check className="mr-2 h-4 w-4" />
                All Photos Reviewed
              </Button>
            ) : isCurrentViewReviewed ? (
              <div className="flex items-center justify-between">
                <Button variant="success" className="flex-1">
                  <Check className="mr-2 h-4 w-4" />
                  Already Approved
                </Button>
                <button 
                  onClick={handleUnapprove}
                  className="ml-2 text-sm text-[--p-text-subdued] hover:text-[--p-text] underline"
                >
                  Unapprove
                </button>
              </div>
            ) : (
              <Button
                variant="primary"
                onClick={handleApprove}
                className="w-full"
              >
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>
            )}
            
            <div className="flex justify-end">
              {isCurrentViewReviewed || isLastView ? (
                <Button
                  variant="outline"
                  disabled={isLastView && isCurrentViewReviewed}
                  onClick={() => moveToView(currentViewIndex + 1)}
                  className="w-full"
                >
                  {isLastView ? 'Finish' : 'Next'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  className="w-full"
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Thumbnails/Progress */}
        <div className="mt-6">
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
