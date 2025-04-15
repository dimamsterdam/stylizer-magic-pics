
import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from 'lucide-react';

interface SceneBuilderProps {
  onSceneChange: (scene: string) => void;
}

const sceneExamples = [
  "Studio setting with white backdrop and soft lighting",
  "Urban street corner with city lights in the background",
  "Natural outdoor setting with autumn foliage",
  "Beach scene with sunset and gentle waves",
  "Elegant luxury shop interior with marble floors",
  "Minimalist interior with neutral tones and large windows"
];

export const SceneBuilder: React.FC<SceneBuilderProps> = ({ onSceneChange }) => {
  const [sceneDescription, setSceneDescription] = useState('');

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSceneDescription(e.target.value);
    onSceneChange(e.target.value);
  };

  const handleExampleClick = (example: string) => {
    setSceneDescription(example);
    onSceneChange(example);
  };

  return (
    <Card className="bg-[--p-surface] shadow-sm border border-[#E3E5E7]">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-1">
          <Label htmlFor="scene-description" className="text-[--p-text] font-medium">Location & Setting</Label>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                <Info className="h-4 w-4 text-[--p-text-subdued]" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="text-sm text-[--p-text-subdued]">
                Describe the location, atmosphere, props, and setting for your product spotlight.
              </p>
            </HoverCardContent>
          </HoverCard>
        </div>
        
        <Textarea 
          id="scene-description"
          value={sceneDescription}
          onChange={handleDescriptionChange}
          placeholder="Describe the scene, location, props, atmosphere, etc."
          className="min-h-[100px] border-[#E3E5E7]"
        />
        
        <div>
          <Label className="text-[--p-text-subdued] text-sm block mb-2">Examples (click to use)</Label>
          <div className="flex flex-wrap gap-2">
            {sceneExamples.map((example, index) => (
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
      </CardContent>
    </Card>
  );
};
