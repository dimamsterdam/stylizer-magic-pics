
import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info } from 'lucide-react';

interface PhotographyStyleBuilderProps {
  onStyleChange: (style: string) => void;
}

const styleExamples = [
  "Professional product photography with studio lighting and high contrast",
  "Lifestyle photography with natural lighting and soft bokeh",
  "Fashion editorial style with dramatic lighting and vivid colors",
  "Minimalist product photography on plain background with sharp details",
  "Vintage film photography look with warm tones and grain",
  "High-end commercial photography with glossy finish and perfect lighting"
];

export const PhotographyStyleBuilder: React.FC<PhotographyStyleBuilderProps> = ({ onStyleChange }) => {
  const [styleDescription, setStyleDescription] = useState('');

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStyleDescription(e.target.value);
    onStyleChange(e.target.value);
  };

  const handleExampleClick = (example: string) => {
    setStyleDescription(example);
    onStyleChange(example);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Label htmlFor="style-description" className="text-[--p-text] font-medium">Photography Style</Label>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                <Info className="h-4 w-4 text-[--p-text-subdued]" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="text-sm text-[--p-text-subdued]">
                Describe the photography style, lighting, colors, and overall look for your product spotlight.
              </p>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
      
      <Textarea 
        id="style-description"
        value={styleDescription}
        onChange={handleDescriptionChange}
        placeholder="Describe the photography style, lighting, colors, etc."
        className="min-h-[100px] border-[#E3E5E7]"
      />
      
      <div>
        <Label className="text-[--p-text-subdued] text-sm block mb-2">Examples (click to use)</Label>
        <div className="flex flex-wrap gap-2">
          {styleExamples.map((example, index) => (
            <Button 
              key={index}
              variant="monochrome-plain"
              size="sm"
              onClick={() => handleExampleClick(example)}
              className="text-xs"
            >
              {example.length > 20 ? example.substring(0, 20) + '...' : example}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
