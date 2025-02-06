import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface PublishImage {
  id: string;
  url: string;
}

const Publish = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedImages] = useState<PublishImage[]>([
    {
      id: "gen1",
      url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    },
    {
      id: "gen2",
      url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    },
  ]);

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

  return (
    <div className="min-h-screen bg-polaris-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Review and Publish</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-polaris-secondary mb-4">
              Review your selected images before publishing them to your store.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Selected Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {selectedImages.map((image) => (
                <div key={image.id} className="relative">
                  <img
                    src={image.url}
                    alt="Generated product"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2">
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
            disabled={isPublishing}
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