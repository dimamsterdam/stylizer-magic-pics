import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Trash } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface PublishImage {
  id: string;
  url: string;
}

const Publish = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isPublishing, setIsPublishing] = useState(false);
  
  const [selectedImages, setSelectedImages] = useState<PublishImage[]>(
    location.state?.selectedImages || []
  );

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
    navigate("/generation-results");
  };

  const handleDelete = (imageId: string) => {
    setSelectedImages(selectedImages.filter(img => img.id !== imageId));
    toast({
      title: "Image removed",
      description: "The image has been removed from the selection.",
    });
  };

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
              <h1 className="text-display-lg text-polaris-text">Classic White T-Shirt</h1>
              <p className="text-body-md text-polaris-secondary">SKU: WHT-CLASSIC-001</p>
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
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt="Product"
                    className="w-full h-48 object-cover rounded-lg border border-polaris-border"
                  />
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(image.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <div className="bg-polaris-green text-white p-1 rounded-full">
                      <Check className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              ))}
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
            disabled={isPublishing || selectedImages.length === 0}
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