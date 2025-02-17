
import React from 'react';

interface GeneratedImagePreviewProps {
  imageUrl: string;
  headline: string;
  bodyCopy: string;
}

const GeneratedImagePreview = ({ imageUrl, headline, bodyCopy }: GeneratedImagePreviewProps) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] min-h-[480px]">
        {/* Image Section */}
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

        {/* Content Section */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <h2 className="font-sans font-bold text-display-lg tracking-[-0.02em] text-[#1A1F2C] mb-4 leading-tight">
            {headline}
          </h2>
          <p className="font-sans text-body-md text-[#6D7175] leading-relaxed">
            {bodyCopy}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GeneratedImagePreview;
