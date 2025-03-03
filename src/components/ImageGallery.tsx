
import { useState, useEffect } from "react";
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
  const [loadErrors, setLoadErrors] = useState<Record<string, boolean>>({});
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});

  // Reset loadErrors when images array changes
  useEffect(() => {
    setLoadErrors({});
    setImagesLoaded({});
  }, [images]);

  const handleImageError = (imageId: string, imageUrl: string) => {
    console.error(`Image failed to load: ${imageUrl}`);
    setLoadErrors(prev => ({ ...prev, [imageId]: true }));
  };

  const handleImageLoad = (imageId: string) => {
    setImagesLoaded(prev => ({ ...prev, [imageId]: true }));
  };

  const handleImageClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(id);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images.length === 0 ? (
        <div className="col-span-3 text-center py-10 text-polaris-text-subdued">
          No images available for this product.
        </div>
      ) : (
        images.map((image) => (
          <div
            key={image.id}
            className="relative flex flex-col"
          >
            <div 
              className={`relative cursor-pointer group ${
                image.selected ? "ring-2 ring-polaris-teal rounded-lg" : ""
              }`}
              onClick={(e) => handleImageClick(image.id, e)}
            >
              <div className="w-full h-48 md:h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <img
                  src={loadErrors[image.id] ? '/placeholder.svg' : image.url}
                  alt={image.title || "Product"}
                  className={`w-full h-48 md:h-64 object-cover rounded-lg ${imagesLoaded[image.id] ? 'opacity-100' : 'opacity-0'}`}
                  style={{ transition: 'opacity 0.3s ease-in-out' }}
                  onError={(e) => {
                    handleImageError(image.id, image.url);
                    e.currentTarget.src = '/placeholder.svg';
                    e.currentTarget.className = `w-full h-48 md:h-64 object-cover rounded-lg opacity-100`;
                  }}
                  onLoad={() => handleImageLoad(image.id)}
                />
                {!imagesLoaded[image.id] && !loadErrors[image.id] && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
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
                        src={loadErrors[image.id] ? '/placeholder.svg' : image.url}
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
        ))
      )}
    </div>
  );
};
