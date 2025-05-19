import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Film, CheckCircle2 } from "lucide-react";
import GeneratedImagePreview, { ExposeLayout } from '@/components/GeneratedImagePreview';
import { SlidePrompt } from './SlidePromptEditor';

interface SlideGalleryProps {
  slides: (SlidePrompt & { imageUrl: string })[];
  headline: string;
  bodyCopy: string;
  layout?: ExposeLayout;
  onSelectVariation?: (slideId: string, variationIndex: number) => void;
  onToggleVideo?: (slideId: string) => void;
  isLoading?: boolean;
}

export const SlideGallery = ({ 
  slides, 
  headline, 
  bodyCopy,
  layout = 'default',
  onSelectVariation,
  onToggleVideo,
  isLoading = false
}: SlideGalleryProps) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showVariations, setShowVariations] = useState(false);
  
  const currentSlide = slides[currentSlideIndex];
  
  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
    setShowVariations(false);
  };
  
  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
    setShowVariations(false);
  };
  
  const handleToggleVariations = () => {
    setShowVariations(!showVariations);
  };
  
  const selectVariation = (variationIndex: number) => {
    if (onSelectVariation && currentSlide) {
      onSelectVariation(currentSlide.id, variationIndex);
    }
  };
  
  const toggleVideo = () => {
    if (onToggleVideo && currentSlide) {
      onToggleVideo(currentSlide.id);
    }
  };

  if (slides.length === 0 || isLoading) {
    return (
      <Card className="bg-[#F6F6F7] border border-[#E3E5E7] p-8 flex items-center justify-center h-[400px]">
        <div className="text-center">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C6ECB] mx-auto"></div>
              <p className="mt-4 text-[--p-text-subdued]">Generating slides...</p>
            </>
          ) : (
            <p className="text-[--p-text-subdued]">No slides to preview</p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        {!showVariations ? (
          <div className="relative">
            <GeneratedImagePreview
              imageUrl={currentSlide.imageUrl}
              headline={headline}
              bodyCopy={bodyCopy}
              layout={layout}
            />
            
            {/* Navigation controls */}
            {slides.length > 1 && (
              <>
                <Button
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white/80 hover:bg-white shadow-md"
                  size="sm"
                  variant="outline"
                  onClick={handlePrevSlide}
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span className="sr-only">Previous slide</span>
                </Button>
                <Button
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white/80 hover:bg-white shadow-md"
                  size="sm"
                  variant="outline"
                  onClick={handleNextSlide}
                >
                  <ChevronRight className="h-5 w-5" />
                  <span className="sr-only">Next slide</span>
                </Button>
              </>
            )}
            
            {/* Video indicator */}
            {currentSlide.isVideo && (
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                <Film className="h-3 w-3" />
                <span>Video</span>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(currentSlide.variations || [currentSlide.imageUrl]).map((url, index) => (
              <div 
                key={`variation-${index}`}
                className="relative cursor-pointer group"
                onClick={() => selectVariation(index)}
              >
                <div className={`absolute inset-0 border-2 ${
                  currentSlide.selectedVariation === index ? 'border-[#2C6ECB]' : 'border-transparent'
                } rounded-md transition-all group-hover:border-[#2C6ECB]/50`}></div>
                
                {currentSlide.selectedVariation === index && (
                  <div className="absolute top-2 right-2 bg-[#2C6ECB] text-white rounded-full p-1">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                )}
                
                <img 
                  src={url} 
                  alt={`Variation ${index + 1}`}
                  className="w-full h-auto object-cover rounded-md"
                  onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide thumbnails and controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {slides.map((slide, index) => (
            <button
              key={`thumb-${slide.id}`}
              className={`w-8 h-2 rounded-full ${
                index === currentSlideIndex ? 'bg-[#2C6ECB]' : 'bg-[#E3E5E7]'
              }`}
              onClick={() => {
                setCurrentSlideIndex(index);
                setShowVariations(false);
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        <div className="flex gap-2">
          {currentSlide.variations && currentSlide.variations.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleVariations}
            >
              {showVariations ? 'Show Preview' : 'Show Variations'}
            </Button>
          )}
          
          {onToggleVideo && (
            <Button
              variant={currentSlide.isVideo ? 'default' : 'outline'}
              size="sm"
              onClick={toggleVideo}
            >
              <Film className="h-4 w-4 mr-2" />
              {currentSlide.isVideo ? 'Remove Video' : 'Convert to Video'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
