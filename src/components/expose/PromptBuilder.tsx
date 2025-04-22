import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ModelPromptBuilder } from "@/components/ModelPromptBuilder";
import { ModelAttributes, attributeOptions, getRandomFromArray } from '@/types/modelTypes';
import { ChevronDown, User, MapPin } from 'lucide-react';
interface PromptBuilderProps {
  value: string;
  onChange: (prompt: string) => void;
  onFinalize: (prompt: string) => void;
}
const sceneExamples = ["Studio setting with white backdrop and soft lighting", "Urban street corner with city lights in the background", "Natural outdoor setting with autumn foliage", "Beach scene with sunset and gentle waves", "Elegant luxury shop interior with marble floors", "Minimalist interior with neutral tones and large windows"];
export const PromptBuilder: React.FC<PromptBuilderProps> = ({
  value,
  onChange,
  onFinalize
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [modelAttributes, setModelAttributes] = useState<ModelAttributes>({
    gender: "Female",
    bodyType: "Slim",
    age: "25-35",
    ethnicity: "Caucasian",
    hairLength: "Long",
    hairColor: "Brown",
    style: "polished"
  });
  useEffect(() => {
    // Update the local state when prop value changes
    setInputValue(value);
  }, [value]);
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };
  const handleBlur = () => {
    onFinalize(inputValue);
  };
  const handleModelAttributeChange = (key: keyof ModelAttributes, value: string) => {
    setModelAttributes(prev => ({
      ...prev,
      [key]: value as any
    }));
  };
  const handleModelPromptUpdate = (modelPrompt: string) => {
    // Update the prompt with model info, but try to preserve any scene descriptions
    const sceneMatch = inputValue.match(/Scene:(.*?)(?=Model:|$)/i);
    const sceneDescription = sceneMatch ? sceneMatch[0] : '';
    let newPrompt = '';
    if (sceneDescription) {
      newPrompt = `${sceneDescription} Model: ${modelPrompt}`;
    } else {
      newPrompt = `Model: ${modelPrompt}`;
    }
    setInputValue(newPrompt);
    onChange(newPrompt);
  };
  const handleSceneSelect = (scene: string) => {
    // Update prompt with scene info, but try to preserve any model descriptions
    const modelMatch = inputValue.match(/Model:(.*?)(?=$)/i);
    const modelDescription = modelMatch ? modelMatch[0] : '';
    let newPrompt = '';
    if (modelDescription) {
      newPrompt = `Scene: ${scene}. ${modelDescription}`;
    } else {
      newPrompt = `Scene: ${scene}.`;
    }
    setInputValue(newPrompt);
    onChange(newPrompt);
  };
  return <Card className="bg-[#FEF7CD] shadow-sm border border-[#E3E5E7] mt-4">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-heading text-[--p-text] font-medium">Write your prompt</Label>
        </div>
        
        <Textarea value={inputValue} onChange={handleInputChange} onBlur={handleBlur} className="min-h-[100px] bg-white border-[#E3E5E7]" placeholder="Describe the creative elements for your product image..." />
        
        <div className="flex flex-wrap gap-3 mt-2">
          {/* Fashion Model Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <User className="h-4 w-4" />
                Define Fashion Model
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[550px] p-4" align="start">
              <ModelPromptBuilder attributes={modelAttributes} onChange={handleModelAttributeChange} onPromptUpdate={handleModelPromptUpdate} />
            </PopoverContent>
          </Popover>
          
          {/* Scene Suggestions Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <MapPin className="h-4 w-4" />
                Scene Suggestions
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-2" align="start">
              <div className="space-y-2">
                <Label className="text-sm text-[--p-text-subdued] px-2">
                  Select a scene to add to your prompt
                </Label>
                <div className="space-y-1">
                  {sceneExamples.map((scene, index) => <Button key={index} variant="ghost" className="w-full justify-start text-left" onClick={() => handleSceneSelect(scene)}>
                      {scene}
                    </Button>)}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>;
};