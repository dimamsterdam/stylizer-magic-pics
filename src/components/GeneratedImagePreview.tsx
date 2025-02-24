
import React from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, RotateCw, Save } from 'lucide-react';

interface GeneratedImagePreviewProps {
  imageUrl: string;
  headline: string;
  bodyCopy: string;
  onSelect?: () => void;
  isSelected?: boolean;
}

const GeneratedImagePreview = ({ 
  imageUrl, 
  headline, 
  bodyCopy,
  onSelect,
  isSelected
}: GeneratedImagePreviewProps) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] min-h-[480px]">
        <div className="relative h-[320px] lg:h-full">
          <img 
            src={imageUrl} 
            alt="Generated hero"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          {onSelect && (
            <Button
              variant="secondary"
              size="sm"
              className={`absolute top-4 right-4 ${
                isSelected ? 'bg-polaris-teal text-white' : 'bg-white'
              }`}
              onClick={onSelect}
            >
              {isSelected ? 'Selected' : 'Select'}
            </Button>
          )}
        </div>
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-4">
            <h2 className="font-sans text-display-lg text-[#1A1F2C] leading-tight">
              {headline}
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <MoreVertical className="h-4 w-4 text-[#6D7175]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuItem>
                  <RotateCw className="mr-2 h-4 w-4" />
                  <span>Regenerate</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Save className="mr-2 h-4 w-4" />
                  <span>Add to Library</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-body text-[#6D7175] leading-relaxed">
            {bodyCopy}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GeneratedImagePreview;
