import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check, Trash, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface PublishImage {
  id: string;
  url: string;
  selected?: boolean;
}

interface LocationState {
  selectedImages: PublishImage[];
  selectedProduct?: {
    id: string;
    title: string;
    sku: string;
    image: string;
  };
}

const Publish = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isPublishing, setIsPublishing] = useState(false);
  
  const state = location.state as LocationState;
  const selectedProduct = state?.selectedProduct;
  const [selectedImages, setSelectedImages] = useState<PublishImage[]>(
    (state?.selectedImages || []).map(img => ({ ...img, selected: true }))
  );

  // If no product data, redirect back
  if (!selectedProduct) {
    console.log("No product data in Publish, redirecting back");
    navigate("/");
    return null;
  }

  const handlePublish = async () => {
    setIsPublishing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    toast({
      title: "Success!",
      description: "Your images have been published to your store.",
    });
    
    setIsPublishing(false);
    navigate("/");
  };

  const handleBack = () => {
    navigate("/generation-results", {
      state: { selectedProduct }
    });
  };

  const handleDelete = (imageId: string) => {
    setSelectedImages(selectedImages.filter(img => img.id !== imageId));
    toast({
      title: "Image removed",
      description: "The image has been removed from the selection.",
    });
  };

  const handleToggleSelect = (imageId: string) => {
    setSelectedImages(images => 
      images.map(img => 
        img.id === imageId 
          ? { ...img, selected: !img.selected }
          : img
      )
    );
  };

  // If no images left, show placeholder
  if (selectedImages.length === 0) {
    return (
      <div className="min-h-screen bg-polaris-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="text-display-md text-polaris-text mb-4">
                No images left to publish. Go back to home
              </p>
              <Button
                onClick={() => navigate("/")}
                className="bg-polaris-green hover:bg-polaris-teal text-white"
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-polaris-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center gap-4">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.title}
              className="w-16 h-16 object-cover rounded-md border border-polaris-border"
            />
            <div>
              <h1 className="text-display-lg text-polaris-text">{selectedProduct.title}</h1>
              <p className="text-body-md text-polaris-secondary">SKU: {selectedProduct.sku}</p>
            </div>
          </CardHeader>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-display-md text-polaris-text">Review and Publish</h2>
          </CardHeader>
          <CardContent>
            <p className="text-body-md text-polaris-secondary mb-4">
              Review your selected images before publishing them to your store.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {selectedImages.map((image) => (
                <div 
                  key={image.id} 
                  className="relative group cursor-pointer"
                  onClick={() => handleToggleSelect(image.id)}
                >
                  <img
                    src={image.url}
                    alt="Product"
                    className="w-full h-48 md:h-64 object-cover rounded-lg border border-polaris-border"
                  />
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(image.id);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <div className={`${
                      image.selected 
                        ? "bg-polaris-green" 
                        : "bg-polaris-background border border-polaris-border"
                      } p-1 rounded-full`}
                    >
                      {image.selected ? (
                        <Check className="h-4 w-4 text-white" />
                      ) : (
                        <X className="h-4 w-4 text-polaris-text" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {/* Original Shopify Product Image */}
              <div className="relative">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.title}
                  className="w-full h-48 md:h-64 object-cover rounded-lg border border-polaris-border opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-polaris-background/80 px-3 py-1 rounded-full text-sm text-polaris-text">
                    Original Image
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            className="border-polaris-border text-polaris-text"
          >
            Back to Generation Results
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isPublishing || !selectedImages.some(img => img.selected)}
            className="bg-polaris-green hover:bg-polaris-teal text-white"
          >
            {isPublishing ? "Publishing..." : "Publish to Store"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Publish;