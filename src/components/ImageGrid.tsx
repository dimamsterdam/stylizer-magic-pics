
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import GeneratedImagePreview from './GeneratedImagePreview';
import { Card } from './ui/card';

interface ImageGridProps {
  variations: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  headline: string;
  bodyCopy: string;
}

const ImageGrid = ({ variations, selectedIndex, onSelect, headline, bodyCopy }: ImageGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {variations.map((imageUrl, index) => (
        <Dialog key={index}>
          <DialogTrigger asChild>
            <Card 
              className={`cursor-pointer overflow-hidden ${
                index === selectedIndex ? 'ring-2 ring-polaris-teal' : ''
              }`}
            >
              <img
                src={imageUrl}
                alt={`Variation ${index + 1}`}
                className="w-full h-48 object-cover"
              />
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <GeneratedImagePreview
              imageUrl={imageUrl}
              headline={headline}
              bodyCopy={bodyCopy}
              onSelect={() => onSelect(index)}
              isSelected={index === selectedIndex}
            />
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
};

export default ImageGrid;
