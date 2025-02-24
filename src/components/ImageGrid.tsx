
import React from 'react';
import { Card } from './ui/card';
import GeneratedImagePreview from './GeneratedImagePreview';
import { GalleryControlBar } from './expose/GalleryControlBar';

interface ImageGridProps {
  variations: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  headline: string;
  bodyCopy: string;
}

const ImageGrid = ({ variations, selectedIndex, onSelect, headline, bodyCopy }: ImageGridProps) => {
  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <GalleryControlBar 
        currentIndex={selectedIndex}
        totalCount={variations.length}
      />
      
      {/* Main Preview */}
      <GeneratedImagePreview
        imageUrl={variations[selectedIndex]}
        headline={headline}
        bodyCopy={bodyCopy}
        isSelected={true}
      />
      
      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-4">
        {variations.map((imageUrl, index) => (
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
    </div>
  );
};

export default ImageGrid;
