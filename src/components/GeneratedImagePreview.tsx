
import React from 'react';

export type ExposeLayout = 'default' | 'reversed' | 'editorial';

interface GeneratedImagePreviewProps {
  imageUrl: string;
  headline: string;
  bodyCopy: string;
  onSelect?: () => void;
  isSelected?: boolean;
  layout?: ExposeLayout;
}

const GeneratedImagePreview = ({ 
  imageUrl, 
  headline, 
  bodyCopy,
  layout = 'default'
}: GeneratedImagePreviewProps) => {
  const layouts = {
    default: "grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] min-h-[480px]",
    reversed: "grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] min-h-[480px]",
    editorial: "relative min-h-[480px]"
  };

  const contentStyles = {
    default: "p-8 lg:p-12 flex flex-col justify-center",
    reversed: "p-8 lg:p-12 flex flex-col justify-center",
    editorial: "absolute inset-0 flex flex-col justify-center p-8 lg:p-12 bg-black/40 text-white"
  };

  if (layout === 'editorial') {
    return (
      <div className="bg-white rounded-lg overflow-hidden">
        <div className={layouts[layout]}>
          <div className="absolute inset-0">
            <img 
              src={imageUrl} 
              alt="Generated hero"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>
          <div className={contentStyles[layout]}>
            <div className="mb-4">
              <h2 className="font-sans text-display-lg leading-tight">
                {headline}
              </h2>
            </div>
            <p className="text-body leading-relaxed">
              {bodyCopy}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className={layouts[layout]}>
        {layout === 'reversed' && (
          <div className={contentStyles[layout]}>
            <div className="mb-4">
              <h2 className="font-sans text-display-lg text-[#1A1F2C] leading-tight">
                {headline}
              </h2>
            </div>
            <p className="text-body text-[#6D7175] leading-relaxed">
              {bodyCopy}
            </p>
          </div>
        )}
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
        {layout === 'default' && (
          <div className={contentStyles[layout]}>
            <div className="mb-4">
              <h2 className="font-sans text-display-lg text-[#1A1F2C] leading-tight">
                {headline}
              </h2>
            </div>
            <p className="text-body text-[#6D7175] leading-relaxed">
              {bodyCopy}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratedImagePreview;
