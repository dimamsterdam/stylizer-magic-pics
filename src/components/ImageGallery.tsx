
import { useState } from "react";
import { Check, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface Image {
  id: string;
  url: string;
  selected: boolean;
  title?: string;
}

interface ImageGalleryProps {
  images: Image[];
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

export const ImageGallery = ({ images, onSelect, onRemove }: ImageGalleryProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((image) => (
        <div
          key={image.id}
          className="relative flex flex-col"
        >
          <div 
            className={`relative cursor-pointer group ${
              image.selected ? "ring-2 ring-polaris-teal rounded-lg" : ""
            }`}
            onClick={() => onSelect(image.id)}
          >
            <img
              src={image.url}
              alt={image.title || "Product"}
              className="w-full h-48 md:h-64 object-cover rounded-lg"
              onError={(e) => {
                console.log("Image failed to load:", image.url);
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-white hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <ZoomIn className="h-4 w-4 text-polaris-text" />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 p-0">
                    <img
                      src={image.url}
                      alt={image.title || "Product zoom"}
                      className="w-full h-96 object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </HoverCardContent>
                </HoverCard>
              </div>
              {image.selected && (
                <div className="absolute top-2 left-2">
                  <div className="bg-polaris-teal rounded-full p-1">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>
          {image.title && (
            <div className="mt-2 text-center">
              <p className="text-sm font-medium text-[#1A1F2C] truncate">
                {image.title}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
