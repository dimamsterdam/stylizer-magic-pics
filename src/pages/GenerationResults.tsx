
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { productImages, ProductKey } from "@/data/images";
import { ProductHeader } from "@/components/ProductHeader";
import { GeneratedImageCard } from "@/components/GeneratedImageCard";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedImage {
  id: string;
  url: string;
  selected: boolean;
  angle: string;
  isGenerating?: boolean;
  error?: string;
}

interface LocationState {
  selectedProducts?: {
    id: string;
    title: string;
    sku: string;
    image: string;
  }[];
  selectedAngles?: string[];
  prompt?: string;
}

const GenerationResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const state = location.state as LocationState;
  const selectedProducts = state?.selectedProducts || [];
  const selectedAngles = state?.selectedAngles || [];

  console.log("Selected Products:", selectedProducts);
  console.log("Selected Angles:", selectedAngles);
  console.log("Initial Prompt:", state?.prompt);

  if (selectedProducts.length === 0) {
    navigate("/");
    return null;
  }

  const [prompt, setPrompt] = useState(state?.prompt || "Professional model wearing the product");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>(() => {
    return selectedProducts.flatMap(product => 
      selectedAngles.map(angle => ({
        id: `${product.id}-${angle}`,
        url: '',
        selected: false,
        angle: angle,
        isGenerating: true
      }))
    );
  });

  const generateImage = async (imageId: string) => {
    const [productId, angle] = imageId.split('-');
    const product = selectedProducts.find(p => p.id === productId);
    
    if (!product) {
      console.error('Product not found:', productId);
      return;
    }

    setGeneratedImages(prev => 
      prev.map(img => 
        img.id === imageId 
          ? { ...img, isGenerating: true, error: undefined }
          : img
      )
    );

    try {
      const { data, error } = await supabase.functions.invoke('generate-deepseek-images', {
        body: {
          prompt,
          productId: product.id,
          angle: angle
        }
      });

      if (error) throw error;

      if (!data.imageUrl) {
        throw new Error('No image URL in response');
      }

      console.log('Received image URL:', data.imageUrl);

      setGeneratedImages(prev => 
        prev.map(img => 
          img.id === imageId 
            ? { ...img, url: data.imageUrl, isGenerating: false }
            : img
        )
      );
    } catch (error) {
      console.error('Error generating image:', error);
      setGeneratedImages(prev => 
        prev.map(img => 
          img.id === imageId 
            ? { ...img, isGenerating: false, error: error.message }
            : img
        )
      );
      
      toast({
        title: "Error generating image",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Start generating all images when component mounts
  useEffect(() => {
    generatedImages.forEach(img => {
      generateImage(img.id);
    });
  }, []); // Only run once when component mounts

  const handleImageSelect = (id: string) => {
    setGeneratedImages(
      generatedImages.map((img) =>
        img.id === id ? { ...img, selected: !img.selected } : img
      )
    );
  };

  const handleImageRemove = (id: string) => {
    setGeneratedImages(generatedImages.filter((img) => img.id !== id));
    toast({
      title: "Image removed",
      description: "The generated image has been removed.",
    });
  };

  const handleRegenerateImage = (id: string) => {
    const image = generatedImages.find(img => img.id === id);
    if (image) {
      generateImage(id);
      toast({
        title: "Regenerating image",
        description: `A new ${image.angle.toLowerCase()} image is being generated...`,
      });
    }
  };

  const handlePromptUpdate = () => {
    generatedImages.forEach(img => {
      generateImage(img.id);
    });
    toast({
      title: "Updating generations",
      description: "New images are being generated with the updated prompt...",
    });
  };

  const handlePublish = () => {
    const selectedImages = generatedImages.filter((img) => img.selected);
    navigate("/publish", { 
      state: { 
        selectedImages: selectedImages.map(img => ({
          id: img.id,
          url: img.url,
          isAiGenerated: true,
          angle: img.angle
        })),
        selectedProducts
      } 
    });
  };

  const selectedCount = generatedImages.filter((img) => img.selected).length;

  const groupedImages = selectedAngles.reduce((acc, angle) => {
    acc[angle] = generatedImages.filter(img => img.angle === angle);
    return acc;
  }, {} as Record<string, GeneratedImage[]>);

  return (
    <div className="min-h-screen bg-polaris-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col space-y-6">
              {selectedProducts.map(product => (
                <ProductHeader
                  key={product.id}
                  image={product.image}
                  title={product.title}
                  sku={product.sku}
                />
              ))}
              <div className="space-y-2">
                <h2 className="text-display-sm text-polaris-text">Generation Prompt</h2>
                <div className="flex gap-4">
                  <Input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handlePromptUpdate}
                    className="bg-polaris-green hover:bg-polaris-teal text-white whitespace-nowrap"
                  >
                    Update Prompt
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {Object.entries(groupedImages).map(([angle, images]) => (
          <Card key={angle} className="mb-8">
            <CardHeader>
              <h2 className="text-display-md text-polaris-text">{angle}</h2>
              <p className="text-body-md text-polaris-secondary mb-4">
                Select the images you want to publish
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image) => (
                  <GeneratedImageCard
                    key={image.id}
                    {...image}
                    onSelect={handleImageSelect}
                    onRemove={handleImageRemove}
                    onRegenerate={handleRegenerateImage}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {selectedCount > 0 && (
          <div className="mt-8 flex justify-end">
            <Button
              className="bg-polaris-green hover:bg-polaris-teal text-white"
              size="lg"
              onClick={handlePublish}
            >
              Publish {selectedCount} Selected {selectedCount === 1 ? "Image" : "Images"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerationResults;
