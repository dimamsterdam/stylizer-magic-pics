
import { useState } from "react";
import { ProductPicker } from "@/components/ProductPicker";
import { ImageGallery } from "@/components/ImageGallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface Product {
  id: string;
  title: string;
  sku: string;
  image: string;
}

interface Image {
  id: string;
  url: string;
  selected: boolean;
}

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [prompt, setPrompt] = useState("");

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setImages([
      {
        id: "2",
        url: product.image,
        selected: false,
      },
    ]);
    toast({
      title: "Product selected",
      description: "Product images have been loaded.",
    });
  };

  const handleImageSelect = (id: string) => {
    setImages(
      images.map((img) =>
        img.id === id ? { ...img, selected: !img.selected } : img
      )
    );
  };

  const handleImageRemove = (id: string) => {
    setImages(images.filter((img) => img.id !== id));
    toast({
      title: "Image removed",
      description: "The image has been removed from selection.",
    });
  };

  const canStartGeneration = selectedProduct && images.some((img) => img.selected) && prompt.trim();

  const handleStartGeneration = () => {
    if (canStartGeneration) {
      navigate("/generation-results", {
        state: {
          selectedProduct: selectedProduct
        }
      });
      toast({
        title: "Starting generation",
        description: "Your images are being generated...",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F6F7] to-[#E5DEFF]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!selectedProduct && (
          <>
            <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <h1 className="text-display-xl text-[#1A1F2C] mb-4 tracking-tight">
                  Welcome to Stylizer
                </h1>
                <p className="text-body-lg text-[#6D7175] max-w-2xl">
                  Transform your product photos into professional lifestyle images using AI. 
                  Start by selecting a product below to enhance its visual appeal.
                </p>
              </CardHeader>
            </Card>
            <ProductPicker onSelect={handleProductSelect} />
          </>
        )}
        
        {selectedProduct && (
          <div className="space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <h2 className="text-display-lg text-[#1A1F2C] tracking-tight">
                  {selectedProduct.title}
                </h2>
                <p className="text-body-md text-[#6D7175]">SKU: {selectedProduct.sku}</p>
              </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <h2 className="text-display-md text-[#1A1F2C] tracking-tight">
                  Product Images
                </h2>
                <p className="text-body-md text-[#6D7175]">Select the product image to use</p>
              </CardHeader>
              <CardContent>
                <ImageGallery
                  images={images}
                  onSelect={handleImageSelect}
                  onRemove={handleImageRemove}
                />
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <h2 className="text-display-md text-[#1A1F2C] tracking-tight">
                  Style Prompt
                </h2>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Describe the style you want (e.g., 'Professional model wearing the shirt in an urban setting')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="mb-4"
                />
                <Button
                  className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white font-medium px-6 py-2 rounded-lg transition-colors"
                  disabled={!canStartGeneration}
                  onClick={handleStartGeneration}
                >
                  Start Generation
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
