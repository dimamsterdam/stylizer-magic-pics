import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, RefreshCw, Trash, ZoomIn } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GeneratedImage {
  id: string;
  url: string;
  selected: boolean;
}

interface LocationState {
  selectedProduct?: {
    id: string;
    title: string;
    sku: string;
    image: string;
  };
}

const GenerationResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { selectedProduct } = (location.state as LocationState) || {};
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("Professional model wearing the shirt in an urban setting");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([
    {
      id: "gen1",
      url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
      selected: false,
    },
    {
      id: "gen2",
      url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
      selected: false,
    },
    {
      id: "gen3",
      url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
      selected: false,
    },
    {
      id: "gen4",
      url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
      selected: false,
    },
    {
      id: "gen5",
      url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
      selected: false,
    },
    {
      id: "gen6",
      url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
      selected: false,
    },
  ]);

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
    console.log("Regenerating image:", id);
    toast({
      title: "Regenerating image",
      description: "A new image is being generated...",
    });
  };

  const handlePromptUpdate = () => {
    console.log("Updating prompt:", prompt);
    toast({
      title: "Updating generations",
      description: "New images are being generated with the updated prompt...",
    });
  };

  const handlePublish = () => {
    const selectedImages = generatedImages.filter((img) => img.selected);
    console.log("Publishing images:", selectedImages);
    navigate("/publish", { 
      state: { 
        selectedImages: selectedImages.map(img => ({
          id: img.id,
          url: img.url,
          isAiGenerated: true
        }))
      } 
    });
  };

  const selectedCount = generatedImages.filter((img) => img.selected).length;

  return (
    <div className="min-h-screen bg-polaris-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center gap-4">
            {selectedProduct ? (
              <img
                src={selectedProduct.image}
                alt={selectedProduct.title}
                className="w-16 h-16 object-cover rounded-md border border-polaris-border"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-md border border-polaris-border" />
            )}
            <div>
              <h1 className="text-display-lg text-polaris-text">
                {selectedProduct?.title || "Product"}
              </h1>
              <p className="text-body-md text-polaris-secondary">
                SKU: {selectedProduct?.sku || "N/A"}
              </p>
            </div>
          </CardHeader>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-display-md text-polaris-text">Generation Prompt</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handlePromptUpdate}
                className="bg-polaris-green hover:bg-polaris-teal text-white"
              >
                Update Prompt
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-display-md text-polaris-text">Generated Images</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {generatedImages.map((image) => (
                <div
                  key={image.id}
                  className={`relative group cursor-pointer ${
                    image.selected ? "ring-2 ring-polaris-teal rounded-lg" : ""
                  }`}
                  onClick={() => handleImageSelect(image.id)}
                >
                  <img
                    src={image.url}
                    alt="Generated product"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg">
                    <div className="absolute top-2 right-2 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageRemove(image.id);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRegenerateImage(image.id);
                        }}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 bg-white"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <img
                            src={image.url}
                            alt="Generated product"
                            className="w-full h-auto rounded-lg"
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                    {image.selected && (
                      <div className="absolute top-2 left-2">
                        <div className="bg-polaris-teal rounded-full p-1">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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