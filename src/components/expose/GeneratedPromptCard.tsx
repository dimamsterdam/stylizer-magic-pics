
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface GeneratedPromptCardProps {
  sceneDescription: string;
  modelPrompt: string;
  onChange: (prompt: string) => void;
  onFinalize: (prompt: string) => void;
}

export const GeneratedPromptCard: React.FC<GeneratedPromptCardProps> = ({
  sceneDescription,
  modelPrompt,
  onChange,
  onFinalize
}) => {
  const [finalPrompt, setFinalPrompt] = useState('');

  useEffect(() => {
    let prompt = '';
    if (sceneDescription) {
      prompt += `Scene: ${sceneDescription}. `;
    }
    if (modelPrompt) {
      prompt += `Model: ${modelPrompt}`;
    }
    setFinalPrompt(prompt);
    onChange(prompt);
  }, [sceneDescription, modelPrompt, onChange]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFinalPrompt(e.target.value);
    onChange(e.target.value);
  };

  const handleBlur = () => {
    onFinalize(finalPrompt);
  };

  return (
    <Card className="bg-[#FEF7CD] shadow-sm border border-[#E3E5E7] mt-4">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-heading text-[--p-text] font-medium">Generated Prompt</Label>
        </div>
        
        <Textarea 
          value={finalPrompt}
          onChange={handlePromptChange}
          onBlur={handleBlur}
          className="min-h-[100px] bg-white border-[#E3E5E7]"
          placeholder="Your generated prompt will appear here..."
        />
      </CardContent>
    </Card>
  );
};
