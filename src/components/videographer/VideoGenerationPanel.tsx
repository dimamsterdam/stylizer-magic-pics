
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2 } from "lucide-react";

interface VideoGenerationPanelProps {
  selectedProduct: string | null;
  setVideoUrl: (url: string | null) => void;
}

export const VideoGenerationPanel: React.FC<VideoGenerationPanelProps> = ({ 
  selectedProduct, 
  setVideoUrl 
}) => {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("product-showcase");
  const [duration, setDuration] = useState("15");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateVideo = async () => {
    if (!selectedProduct) return;
    
    setIsGenerating(true);
    
    // Simulate video generation delay
    setTimeout(() => {
      // For demo purposes, just set a placeholder video
      setVideoUrl("https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
      setIsGenerating(false);
    }, 3000);
    
    // In a real implementation, you would call a Supabase Edge Function to generate the video
    // const { data, error } = await supabase.functions.invoke('generate-product-video', {
    //   body: { productId: selectedProduct, prompt, style, durationSeconds: Number(duration) }
    // });
    
    // if (data?.videoUrl) {
    //   setVideoUrl(data.videoUrl);
    // }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="prompt">Video Prompt</Label>
        <Textarea
          id="prompt"
          placeholder="Describe the video you want to generate..."
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="style">Video Style</Label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger id="style">
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="product-showcase">Product Showcase</SelectItem>
              <SelectItem value="lifestyle">Lifestyle</SelectItem>
              <SelectItem value="tutorial">Tutorial</SelectItem>
              <SelectItem value="testimonial">Testimonial</SelectItem>
              <SelectItem value="advertisement">Advertisement</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (seconds)</Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger id="duration">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 seconds</SelectItem>
              <SelectItem value="30">30 seconds</SelectItem>
              <SelectItem value="60">60 seconds</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button
        variant="primary"
        className="w-full"
        onClick={generateVideo}
        disabled={!selectedProduct || !prompt || isGenerating}
      >
        <Wand2 className="mr-2 h-4 w-4" />
        {isGenerating ? "Generating Video..." : "Generate Video"}
      </Button>
      
      <p className="text-xs text-muted-foreground">
        Note: Video generation may take several minutes depending on the complexity of your request.
      </p>
    </div>
  );
};
