import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, PlusCircle, RefreshCw } from "lucide-react";
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';

export interface SlidePrompt {
  id: string;
  text: string;
  imageUrl?: string;
  variations?: string[];
  selectedVariation?: number;
  status?: 'pending' | 'generating' | 'completed' | 'error';
  isVideo?: boolean;
}

interface SlidePromptEditorProps {
  slides: SlidePrompt[];
  onSlideUpdate: (slides: SlidePrompt[]) => void;
  maxSlides?: number;
  isGenerating?: boolean;
}

export const SlidePromptEditor = ({ 
  slides, 
  onSlideUpdate, 
  maxSlides = 5,
  isGenerating = false 
}: SlidePromptEditorProps) => {
  const { toast } = useToast();
  
  const updateSlideText = (id: string, text: string) => {
    const updatedSlides = slides.map(slide => 
      slide.id === id ? { ...slide, text } : slide
    );
    onSlideUpdate(updatedSlides);
  };

  const addSlide = () => {
    if (slides.length >= maxSlides) {
      toast({
        title: "Maximum slides reached",
        description: `You can have a maximum of ${maxSlides} slides.`,
        variant: "destructive",
      });
      return;
    }

    const newSlide: SlidePrompt = {
      id: `slide-${Date.now()}`,
      text: "",
      status: 'pending',
      isVideo: false
    };
    onSlideUpdate([...slides, newSlide]);
  };

  const removeSlide = (id: string) => {
    if (slides.length <= 1) {
      toast({
        title: "Cannot remove slide",
        description: "You need at least one slide in your spotlight.",
        variant: "destructive",
      });
      return;
    }
    
    const updatedSlides = slides.filter(slide => slide.id !== id);
    onSlideUpdate(updatedSlides);
  };

  const regeneratePrompt = (id: string) => {
    // In a real implementation, this would call an AI service to regenerate the prompt
    toast({
      title: "Regenerating prompt",
      description: "Generating a new prompt for this slide...",
    });
    
    // For now, we'll just mark it as pending
    const updatedSlides = slides.map(slide => 
      slide.id === id ? { ...slide, status: 'pending' as const } : slide
    );
    onSlideUpdate(updatedSlides);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-heading text-[--p-text]">Slide Prompts ({slides.length}/{maxSlides})</h3>
        <Button
          onClick={addSlide}
          variant="outline"
          size="sm"
          disabled={slides.length >= maxSlides || isGenerating}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Slide
        </Button>
      </div>
      
      <div className="space-y-4">
        {slides.map((slide, index) => (
          <Card key={slide.id} className="border border-[#E3E5E7]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor={`slide-${slide.id}`} className="font-medium">
                  Slide {index + 1}
                </Label>
                <div className="flex gap-2">
                  <Button
                    onClick={() => regeneratePrompt(slide.id)}
                    size="sm"
                    variant="outline"
                    disabled={isGenerating}
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="sr-only">Regenerate</span>
                  </Button>
                  <Button
                    onClick={() => removeSlide(slide.id)}
                    size="sm"
                    variant="outline"
                    disabled={slides.length <= 1 || isGenerating}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
              <Textarea
                id={`slide-${slide.id}`}
                value={slide.text}
                onChange={(e) => updateSlideText(slide.id, e.target.value)}
                placeholder="Describe what you want to see in this slide..."
                className="min-h-[100px]"
                disabled={isGenerating}
              />
              {slide.status === 'error' && (
                <p className="text-red-500 text-sm mt-2">
                  There was an error generating this slide. Please try again.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
