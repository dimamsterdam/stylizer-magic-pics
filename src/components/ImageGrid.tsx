
import React, { useState } from 'react';
import { Card } from './ui/card';
import GeneratedImagePreview, { ExposeLayout } from './GeneratedImagePreview';
import { GalleryControlBar } from './expose/GalleryControlBar';
import { Button } from './ui/button';
import { LayoutTemplate, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGridProps {
  variations: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  headline: string;
  bodyCopy: string;
}

const ImageGrid = ({ variations, selectedIndex, onSelect, headline, bodyCopy }: ImageGridProps) => {
  const [currentLayout, setCurrentLayout] = useState<ExposeLayout>('reversed');
  
  const layouts: { label: string; value: ExposeLayout }[] = [
    { label: 'Top', value: 'reversed' },
    { label: 'Bottom', value: 'default' },
    { label: 'Editorial', value: 'editorial' },
  ];

  // Ensure variations is an array of strings
  const safeVariations = Array.isArray(variations) ? 
    variations.filter((url): url is string => typeof url === 'string') : 
    [];

  const handlePrevious = () => {
    const newIndex = selectedIndex === 0 ? safeVariations.length - 1 : selectedIndex - 1;
    onSelect(newIndex);
  };

  const handleNext = () => {
    const newIndex = selectedIndex === safeVariations.length - 1 ? 0 : selectedIndex + 1;
    onSelect(newIndex);
  };

  if (safeVariations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <GalleryControlBar 
        currentIndex={selectedIndex}
        totalCount={safeVariations.length}
      />
      
      {/* Main Preview with Navigation */}
      <div className="relative">
        <GeneratedImagePreview
          imageUrl={safeVariations[selectedIndex] || '/placeholder.svg'}
          headline={headline}
          bodyCopy={bodyCopy}
          isSelected={true}
          layout={currentLayout}
        />
        
        {safeVariations.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      
      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-4">
        {safeVariations.map((imageUrl, index) => (
          <Card 
            key={index}
            className={`cursor-pointer overflow-hidden ${
              index === selectedIndex ? 'ring-2 ring-[#1A1F2C]' : ''
            }`}
            onClick={() => onSelect(index)}
          >
            <img
              src={imageUrl}
              alt={`Variation ${index + 1}`}
              className="w-full h-24 object-cover"
            />
          </Card>
        ))}
      </div>

      {/* Layout Controls */}
      <div className="flex items-center justify-start gap-2 pt-2 border-t border-[--p-border]">
        <div className="flex items-center gap-1">
          <LayoutTemplate className="h-4 w-4 text-[--p-text-subdued]" />
          <span className="text-sm text-[--p-text-subdued]">Layout:</span>
        </div>
        {layouts.map((layout) => (
          <Button
            key={layout.value}
            variant={currentLayout === layout.value ? "primary" : "ghost"}
            size="sm"
            onClick={() => setCurrentLayout(layout.value)}
          >
            {layout.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ImageGrid;
