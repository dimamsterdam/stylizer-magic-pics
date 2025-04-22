
import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModelPromptBuilder } from '@/components/ModelPromptBuilder';
import { SceneBuilder } from '@/components/expose/SceneBuilder';
import { PhotographyStyleBuilder } from '@/components/expose/PhotographyStyleBuilder';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ModelAttributes } from '@/types/modelTypes';

interface AdvancedPromptBuilderProps {
  themeDescription: string;
  onPromptChange: (prompt: string) => void;
}

export const AdvancedPromptBuilder: React.FC<AdvancedPromptBuilderProps> = ({
  themeDescription,
  onPromptChange
}) => {
  const [sceneDescription, setSceneDescription] = useState('');
  const [photographyStyle, setPhotographyStyle] = useState('');
  const [modelAttributes, setModelAttributes] = useState<ModelAttributes>({
    gender: "Female",
    bodyType: "Slim",
    age: "25-35",
    ethnicity: "Caucasian",
    hairLength: "Long",
    hairColor: "Brown",
    style: "polished"
  });
  const [finalPrompt, setFinalPrompt] = useState(themeDescription);
  const [open, setOpen] = useState(false);

  const handleModelAttributeChange = (key: keyof typeof modelAttributes, value: string) => {
    setModelAttributes(prev => ({
      ...prev,
      [key]: value
    }));
    updateFinalPrompt();
  };

  const updateFinalPrompt = () => {
    const modelDescription = `${modelAttributes.gender} fashion model with ${modelAttributes.bodyType} build, aged ${modelAttributes.age}, 
    ${modelAttributes.ethnicity} ethnicity with ${modelAttributes.hairLength} ${modelAttributes.hairColor} hair, having a ${modelAttributes.style} look.`;
    
    let prompt = '';
    
    if (sceneDescription) {
      prompt += `Scene: ${sceneDescription}. `;
    }
    
    prompt += `Model: ${modelDescription}. `;
    
    if (photographyStyle) {
      prompt += `Photography style: ${photographyStyle}. `;
    }
    
    setFinalPrompt(prompt);
  };

  const handleSceneChange = (scene: string) => {
    setSceneDescription(scene);
    updateFinalPrompt();
  };

  const handlePhotographyStyleChange = (style: string) => {
    setPhotographyStyle(style);
    updateFinalPrompt();
  };

  const handleApplyPrompt = () => {
    onPromptChange(finalPrompt);
    setOpen(false);
  };

  const handleModelPromptUpdate = (prompt: string) => {
    const modelDescription = prompt;
    setFinalPrompt(prev => {
      let updatedPrompt = '';
      
      if (sceneDescription) {
        updatedPrompt += `Scene: ${sceneDescription}. `;
      }
      
      updatedPrompt += `Model: ${modelDescription}. `;
      
      if (photographyStyle) {
        updatedPrompt += `Photography style: ${photographyStyle}. `;
      }
      
      return updatedPrompt;
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="hover:bg-[--p-surface-hovered]">
          <Settings className="h-4 w-4 mr-1" /> Advanced
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[550px] p-0 border border-[#E3E5E7] shadow-lg bg-white" align="end" sideOffset={8}>
        <div className="p-4 border-b border-[#E3E5E7]">
          <h3 className="font-medium text-[16px] text-[--p-text]">Advanced Prompt Builder</h3>
          <p className="text-[14px] text-[--p-text-subdued] mt-1">Customize your creative brief with detailed specifications</p>
        </div>
        
        <Tabs defaultValue="scene" className="p-4">
          <TabsList className="grid grid-cols-3 mb-4 bg-[#F6F6F7] p-1 rounded-md">
            <TabsTrigger value="scene" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Scene</TabsTrigger>
            <TabsTrigger value="model" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Fashion Model</TabsTrigger>
            <TabsTrigger value="photography" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Photography Style</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scene" className="mt-0">
            <SceneBuilder onSceneChange={handleSceneChange} />
          </TabsContent>
          
          <TabsContent value="model" className="mt-0">
            <div className="bg-[#FAFBFB] p-4 rounded-lg">
              <ModelPromptBuilder 
                attributes={modelAttributes} 
                onChange={handleModelAttributeChange}
                onPromptUpdate={handleModelPromptUpdate} 
              />
            </div>
          </TabsContent>
          
          <TabsContent value="photography" className="mt-0">
            <PhotographyStyleBuilder onStyleChange={handlePhotographyStyleChange} />
          </TabsContent>
        </Tabs>
        
        <div className="p-4 border-t border-[#E3E5E7] bg-[#FAFBFB]">
          <Label htmlFor="final-prompt" className="text-sm font-medium text-[--p-text] mb-2 block">Final Prompt</Label>
          <Textarea 
            id="final-prompt" 
            value={finalPrompt}
            onChange={(e) => setFinalPrompt(e.target.value)}
            className="min-h-[100px] border-[#E3E5E7] bg-white"
          />
          
          <div className="flex justify-end mt-4 gap-2">
            <Button 
              variant="monochrome-plain" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              onClick={handleApplyPrompt}
            >
              Apply to Creative Brief
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
