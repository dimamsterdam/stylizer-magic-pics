
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

const fashionImages = [
  { src: "/lovable-uploads/01c51803-441a-4b90-ad49-fc25ca184153.png", alt: "Fashion 1" },
  { src: "/lovable-uploads/047c9307-af3c-47c6-b2e6-ea9d51a0c8cc.png", alt: "Fashion 2" },
  { src: "/lovable-uploads/0f0a212c-5edc-4c90-a258-6b43222bac06.png", alt: "Fashion 3" },
  { src: "/lovable-uploads/12022501-6211-4169-ad19-4d93700c8c9f.png", alt: "Fashion 4" },
  { src: "/lovable-uploads/61d9b435-6552-49b0-a269-25c905ba18c9.png", alt: "Fashion 5" },
  { src: "/lovable-uploads/85ad1b88-47a8-4226-bc2e-63fa2dcf049a.png", alt: "Fashion 6" },
  { src: "/lovable-uploads/9bac9fd0-2115-4bae-8108-0b973f83db37.png", alt: "Fashion 7" },
  { src: "/lovable-uploads/af88ce94-30e1-4875-b411-1c07060016c2.png", alt: "Fashion 8" },
];

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!selectedProduct && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
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
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {fashionImages.map((image, index) => (
                  <div 
                    key={index}
                    className="relative group overflow-hidden rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-40 object-cover rounded-lg transform transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))}
              </div>
            </div>
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
