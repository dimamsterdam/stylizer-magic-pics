
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { SlidePrompt } from './SlidePromptEditor';

interface SlideStoryGeneratorProps {
  productName: string;
  designBrief: string;
  onStoriesGenerated: (slides: SlidePrompt[]) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
}

export const SlideStoryGenerator = ({
  productName,
  designBrief,
  onStoriesGenerated,
  isGenerating,
  setIsGenerating,
}: SlideStoryGeneratorProps) => {
  const [error, setError] = useState<string | null>(null);
  
  const generateSlideStories = async () => {
    try {
      setError(null);
      setIsGenerating(true);
      
      // In a real implementation, this would call an AI service
      // For now, we'll use mock data with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock slide stories based on product and design brief
      const mockSlides: SlidePrompt[] = [
        {
          id: `slide-${Date.now()}-1`,
          text: `A lifestyle shot showing the ${productName} in a ${designBrief} setting, captured from a frontal angle highlighting the product's design.`,
          status: 'completed'
        },
        {
          id: `slide-${Date.now()}-2`,
          text: `Close-up detail shot of the ${productName} focusing on craftsmanship and texture, with soft studio lighting to emphasize quality.`,
          status: 'completed'
        },
        {
          id: `slide-${Date.now()}-3`,
          text: `The ${productName} in action being used/worn by a model in an authentic ${designBrief} environment, showing its functionality.`,
          status: 'completed'
        }
      ];
      
      onStoriesGenerated(mockSlides);
    } catch (err) {
      console.error('Error generating slide stories:', err);
      setError('Failed to generate slide stories. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border border-[#E3E5E7]">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-heading text-[--p-text] mb-1">Generate Slide Stories</h3>
            <p className="text-sm text-[--p-text-subdued]">
              Let AI create a cohesive story across multiple slides featuring your {productName}
            </p>
          </div>
          
          <Button
            onClick={generateSlideStories}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Story
              </>
            )}
          </Button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
