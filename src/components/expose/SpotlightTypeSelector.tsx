
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ImageIcon, SlidersHorizontal } from "lucide-react";

interface SpotlightTypeSelectorProps {
  isMultiSlide: boolean;
  onChange: (isMultiSlide: boolean) => void;
}

export const SpotlightTypeSelector = ({ isMultiSlide, onChange }: SpotlightTypeSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Card 
          className={`p-4 cursor-pointer border ${!isMultiSlide ? 'border-[#2C6ECB]' : 'border-[#E3E5E7]'} transition-all duration-200 flex-1`}
          onClick={() => onChange(false)}
        >
          <div className="flex items-center gap-3">
            <div className={`rounded-full h-5 w-5 flex items-center justify-center ${!isMultiSlide ? 'bg-[#2C6ECB] text-white' : 'border border-[#8C9196]'}`}>
              {!isMultiSlide && <Check size={12} />}
            </div>
            <span className="font-medium">Single Image</span>
          </div>
          <div className="mt-4 bg-[#F6F6F7] rounded-md aspect-video flex items-center justify-center">
            <ImageIcon className="h-10 w-10 text-[#8C9196]" />
          </div>
          <p className="mt-3 text-sm text-[--p-text-subdued]">
            Create a spotlight with a single hero image
          </p>
        </Card>
        
        <Card 
          className={`p-4 cursor-pointer border ${isMultiSlide ? 'border-[#2C6ECB]' : 'border-[#E3E5E7]'} transition-all duration-200 flex-1`}
          onClick={() => onChange(true)}
        >
          <div className="flex items-center gap-3">
            <div className={`rounded-full h-5 w-5 flex items-center justify-center ${isMultiSlide ? 'bg-[#2C6ECB] text-white' : 'border border-[#8C9196]'}`}>
              {isMultiSlide && <Check size={12} />}
            </div>
            <span className="font-medium">Multi-Slide Spotlight</span>
          </div>
          <div className="mt-4 bg-[#F6F6F7] rounded-md aspect-video flex items-center justify-center">
            <SlidersHorizontal className="h-10 w-10 text-[#8C9196]" />
          </div>
          <p className="mt-3 text-sm text-[--p-text-subdued]">
            Create a spotlight with multiple slides to tell a story
          </p>
        </Card>
      </div>
    </div>
  );
};
