
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
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
  const [prompt] = useState(state?.prompt || "Professional model wearing the product");

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

  useEffect(() => {
    if (selectedProducts.length === 0) {
      navigate("/");
    }
  }, [selectedProducts, navigate]);

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
      const { data, error } = await supabase.functions.invoke('generate-ai-image', {
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

  useEffect(() => {
    generatedImages.forEach(img => {
      generateImage(img.id);
    });
  }, []);

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

  if (selectedProducts.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-polaris-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col space-y-6">
              <div className="flex items-center justify-center">
                {selectedProducts.map(product => (
                  <img
                    key={product.id}
                    src={product.image}
                    alt={product.title}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
              <div className="space-y-2">
                <h2 className="text-display-sm text-polaris-text">Generation Prompt</h2>
                <div className="bg-[#FEF7CD] p-6 rounded-lg border-l-4 border-[#9b87f5] mb-4">
                  <p className="text-[#1A1F2C] text-body-md">{prompt}</p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <h2 className="text-display-lg text-polaris-text mb-6">Generation Results</h2>

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
