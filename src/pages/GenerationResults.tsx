import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Plus, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

const GenerationResults = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
    navigate("/publish");
  };

  const selectedCount = generatedImages.filter((img) => img.selected).length;

  return (
    <div className="min-h-screen bg-polaris-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop"
              alt="Original product"
              className="w-16 h-16 object-cover rounded-md border border-polaris-border"
            />
            <div>
              <CardTitle>Classic White T-Shirt</CardTitle>
              <p className="text-polaris-secondary">SKU: WHT-CLASSIC-001</p>
            </div>
          </CardHeader>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Generation Prompt</CardTitle>
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
            <CardTitle>Generated Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {generatedImages.map((image) => (
                <Dialog key={image.id}>
                  <DialogTrigger asChild>
                    <div
                      className={`relative group cursor-pointer ${
                        image.selected ? "ring-2 ring-polaris-teal" : ""
                      }`}
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
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="secondary"
                            className={`bg-white text-polaris-text hover:bg-polaris-teal hover:text-white ${
                              image.selected ? "bg-polaris-teal text-white" : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageSelect(image.id);
                            }}
                          >
                            <Check className={`mr-2 h-4 w-4 ${image.selected ? "opacity-100" : "opacity-0"}`} />
                            {image.selected ? "Selected" : "Select"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <img
                      src={image.url}
                      alt="Generated product"
                      className="w-full h-auto rounded-lg"
                    />
                  </DialogContent>
                </Dialog>
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