
import React, { useState } from 'react';
import { Card } from './ui/card';
import GeneratedImagePreview, { ExposeLayout } from './GeneratedImagePreview';
import { GalleryControlBar } from './expose/GalleryControlBar';
import { Button } from './ui/button';
import { LayoutTemplate } from 'lucide-react';

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

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <GalleryControlBar 
        currentIndex={selectedIndex}
        totalCount={safeVariations.length}
      />
      
      {/* Main Preview */}
      <GeneratedImagePreview
        imageUrl={safeVariations[selectedIndex] || '/placeholder.svg'}
        headline={headline}
        bodyCopy={bodyCopy}
        isSelected={true}
        layout={currentLayout}
      />
      
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
            variant={currentLayout === layout.value ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentLayout(layout.value)}
            className={currentLayout === layout.value ? "bg-[--p-action-primary] text-white" : "text-[--p-text]"}
          >
            {layout.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ImageGrid;
