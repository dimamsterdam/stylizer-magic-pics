
import React from 'react';
import { Button } from './ui/button';
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
  bodyCopy
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
        </div>
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-4">
            <h2 className="font-sans text-display-lg text-[#1A1F2C] leading-tight">
              {headline}
            </h2>
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
