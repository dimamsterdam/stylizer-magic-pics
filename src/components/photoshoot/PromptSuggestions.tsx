
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Check, GalleryHorizontal } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface PromptSuggestion {
  id: string;
  text: string;
  selected: boolean;
}

interface ShotSuggestionsProps {
  productName: string;
  designBrief: string;
  onContinue: (selectedPrompts: string[]) => void;
  productImage?: string; // Add optional product image prop
}

export const ShotSuggestions = ({ 
  productName, 
  designBrief,
  onContinue,
  productImage = '/placeholder.svg' // Default to placeholder if no image provided
}: ShotSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<PromptSuggestion[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Generate AI suggestions
  useEffect(() => {
    const generateSuggestions = async () => {
      setLoading(true);
      
      // In a real implementation, this would call an AI service
      // For now, we'll use mock data
      const mockSuggestions = [
        `A clean front view of the ${productName} on a white background, highlighting the texture and details`,
        `${productName} shot from a 45-degree angle to show dimension and shape`,
        `Close-up detail shot focusing on the material quality and craftsmanship of the ${productName}`,
        `${productName} in use/being worn in a lifestyle setting that matches its intended purpose`,
        `Product shot with natural lighting to emphasize color accuracy and texture`,
        `Birds-eye view of the ${productName} to showcase the full product layout`,
        `Side profile shot with soft shadows to create depth and dimension`,
        `${productName} with complementary props that enhance its purpose and appeal`,
        `Multiple angles in a collage-style composition to show versatility`,
        `Scale comparison shot showing the ${productName} relative to common objects`
      ];
      
      // Add a short delay to simulate AI processing
      setTimeout(() => {
        setSuggestions(mockSuggestions.map((text, index) => ({
          id: `suggestion-${index}`,
          text,
          selected: false
        })));
        setLoading(false);
      }, 1500);
    };
    
    generateSuggestions();
  }, [productName, designBrief]);

  const toggleSuggestion = (id: string) => {
    setSuggestions(suggestions.map(suggestion => 
      suggestion.id === id 
        ? { ...suggestion, selected: !suggestion.selected } 
        : suggestion
    ));
  };

  const handleAddCustomPrompt = () => {
    if (customPrompt.trim()) {
      const newSuggestion: PromptSuggestion = {
        id: `custom-${Date.now()}`,
        text: customPrompt.trim(),
        selected: true
      };
      setSuggestions([...suggestions, newSuggestion]);
      setCustomPrompt('');
    }
  };

  const handleGenerateClick = () => {
    const selectedPrompts = suggestions
      .filter(suggestion => suggestion.selected)
      .map(suggestion => suggestion.text);
    
    onContinue(selectedPrompts);
  };

  const selectedCount = suggestions.filter(s => s.selected).length;

  return (
    <Card className="bg-[--p-surface] shadow-sm border border-[#E3E5E7] rounded-md">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Product Reference Section */}
          <div className="lg:w-1/3 space-y-4">
            <div>
              <h3 className="text-heading text-[--p-text] mb-1">Product Reference</h3>
              <p className="text-body-sm text-[--p-text-subdued] mb-4">
                Use this image as a reference for your photo shoot
              </p>
            </div>
            
            <div className="relative aspect-square bg-[#F6F6F7] rounded-md overflow-hidden border border-[#E3E5E7]">
              <img 
                src={productImage} 
                alt={productName}
                className="w-full h-full object-contain"
                onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
              />
              <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm p-1 rounded-full">
                <GalleryHorizontal className="h-4 w-4 text-[--p-text]" />
              </div>
            </div>
            
            <div className="p-4 bg-[#F6F6F7] rounded-md border border-[#E3E5E7]">
              <h4 className="font-medium text-[--p-text] mb-1">Product Details</h4>
              <p className="text-sm text-[--p-text-subdued] mb-2">{productName}</p>
              
              <h4 className="font-medium text-[--p-text] mt-3 mb-1">Design Brief</h4>
              <p className="text-sm text-[--p-text-subdued] italic">"{designBrief}"</p>
            </div>
          </div>
          
          <Separator orientation="vertical" className="hidden lg:block h-auto" />
          
          {/* Shot Suggestions Section */}
          <div className="lg:w-2/3 space-y-6">
            <div>
              <h2 className="text-display-sm text-[--p-text] mb-1">Shot Suggestions</h2>
              <p className="text-body text-[--p-text-subdued]">
                Select the photo shots you'd like to include in your shoot
              </p>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C6ECB]"></div>
                <p className="mt-4 text-[--p-text-subdued]">Analyzing your product and generating professional shot suggestions...</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {suggestions.map((suggestion) => (
                    <div 
                      key={suggestion.id}
                      onClick={() => toggleSuggestion(suggestion.id)}
                      className={`
                        p-4 rounded-lg cursor-pointer transition-all 
                        bg-[#FEF7CD] border 
                        ${suggestion.selected ? 'border-[#2C6ECB]' : 'border-transparent'}
                      `}
                    >
                      <div className="flex items-start">
                        <div className="shrink-0 mt-1">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            className={`h-6 w-6 p-0 rounded-full ${suggestion.selected ? 'bg-[#2C6ECB] text-white' : 'bg-white border border-[#8E9196]'}`}
                          >
                            {suggestion.selected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3 text-[#8E9196]" />}
                          </Button>
                        </div>
                        <p className="ml-3 text-[--p-text] font-medium">{suggestion.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-[#E3E5E7]">
                  <Label htmlFor="custom-prompt" className="block text-[--p-text] mb-1">
                    Add your own shot description
                  </Label>
                  <div className="flex space-x-2">
                    <Textarea 
                      id="custom-prompt"
                      placeholder="Describe your custom shot..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddCustomPrompt}
                      disabled={!customPrompt.trim()}
                      variant="plain"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <div className="text-[--p-text-subdued]">
                    {selectedCount} shot{selectedCount !== 1 ? 's' : ''} selected
                  </div>
                  <Button 
                    onClick={handleGenerateClick} 
                    disabled={selectedCount === 0}
                    variant="primary"
                  >
                    Generate Photos
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
