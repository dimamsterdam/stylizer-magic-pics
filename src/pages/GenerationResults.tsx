import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, RefreshCw, Trash, ZoomIn } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  const state = location.state as LocationState;
  const selectedProduct = state?.selectedProduct;

  console.log("Location state:", location.state);
  console.log("Selected product:", selectedProduct);

  if (!selectedProduct) {
    console.log("No product selected, redirecting to index");
    navigate("/");
    return null;
  }

  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("Professional model wearing the shirt in an urban setting");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([
    {
      id: "gen1",
      url: "/lovable-uploads/af88ce94-30e1-4875-b411-1c07060016c2.png",
      selected: false,
    },
    {
      id: "gen2",
      url: "/lovable-uploads/61d9b435-6552-49b0-a269-25c905ba18c9.png",
      selected: false,
    },
    {
      id: "gen3",
      url: "/lovable-uploads/047c9307-af3c-47c6-b2e6-ea9d51a0c8cc.png",
      selected: false,
    },
    {
      id: "gen4",
      url: "/lovable-uploads/01c51803-441a-4b90-ad49-fc25ca184153.png",
      selected: false,
    },
    {
      id: "gen5",
      url: "/lovable-uploads/12022501-6211-4169-ad19-4d93700c8c9f.png",
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
        })),
        selectedProduct // Pass the selected product to the publish page
      } 
    });
  };

  const selectedCount = generatedImages.filter((img) => img.selected).length;

  const renderPromptInput = () => (
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
  );

  const renderProductImage = () => {
    if (selectedProduct?.image) {
      console.log("Rendering product image:", selectedProduct.image);
      return (
        <img
          src={selectedProduct.image}
          alt={selectedProduct.title}
          className="w-16 h-16 object-cover rounded-md border border-polaris-border"
        />
    );
    }

    console.log("No product image, using placeholder");
    return (
      <div className="w-16 h-16 bg-polaris-background rounded-md border border-polaris-border flex items-center justify-center">
        <img
          src="/placeholder.svg"
          alt="Product placeholder"
          className="w-8 h-8 opacity-50"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-polaris-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col space-y-6">
              <div className="flex items-center gap-4">
                {renderProductImage()}
                <div className="flex items-center gap-2">
                  <div>
                    <h1 className="text-display-lg text-polaris-text">
                      {selectedProduct?.title || "Selected product"}
                    </h1>
                    <p className="text-body-md text-polaris-secondary">
                      SKU: {selectedProduct?.sku || "N/A"}
                    </p>
                  </div>
                  <Link 
                    to="/" 
                    className="text-sm text-polaris-teal hover:text-polaris-green ml-2"
                  >
                    change
                  </Link>
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-display-sm text-polaris-text">Generation Prompt</h2>
                {renderPromptInput()}
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-display-md text-polaris-text">Generated Images</h2>
            <p className="text-body-md text-polaris-secondary mb-4">Select the ones you want to publish</p>
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
                    className="w-full h-48 md:h-64 object-cover rounded-lg"
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
