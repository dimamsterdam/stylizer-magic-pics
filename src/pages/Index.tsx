import { useState } from "react";
import { ProductPicker } from "@/components/ProductPicker";
import { ImageGallery } from "@/components/ImageGallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { Check, Wand2 } from "lucide-react";
import { StudioColorPicker } from "@/components/StudioColorPicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

interface AnglePreferences {
  [key: string]: boolean;
}

interface StudioStyle {
  backgroundColor: string;
  isCustomPrompt: boolean;
}

const fashionImages = [
  { src: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80", alt: "Fashion model in urban setting" },
  { src: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80", alt: "Street fashion portrait" },
  { src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80", alt: "Fashion shopping" },
  { src: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80", alt: "Fashion editorial" },
  { src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80", alt: "Model in modern outfit" },
  { src: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=800&q=80", alt: "Contemporary fashion" },
  { src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80", alt: "Street style fashion" },
  { src: "https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=800&q=80", alt: "Fashion lifestyle" }
];

const DEFAULT_ANGLES = {
  "Front View": true,
  "Back View": true,
  "Side View": true,
  "Full Body": true,
};

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isPickingProducts, setIsPickingProducts] = useState(true);
  const [selectedAngles, setSelectedAngles] = useState<AnglePreferences>(DEFAULT_ANGLES);
  const [studioStyle, setStudioStyle] = useState<StudioStyle>({
    backgroundColor: "#FFFFFF",
    isCustomPrompt: false
  });

  const handleProductSelect = (product: Product) => {
    if (selectedProducts.length >= 3) {
      toast({
        title: "Maximum products reached",
        description: "You can select up to 3 products.",
        variant: "destructive",
      });
      return;
    }

    if (selectedProducts.some(p => p.id === product.id)) {
      toast({
        title: "Product already selected",
        description: "This product is already in your selection.",
        variant: "destructive",
      });
      return;
    }

    const updatedProducts = [...selectedProducts, product];
    setSelectedProducts(updatedProducts);
    toast({
      title: "Product added",
      description: `${product.title} has been added to your selection.`,
    });
  };

  const handleProductRemove = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    toast({
      title: "Product removed",
      description: "Product has been removed from your selection.",
    });
  };

  const handleConfirmSelection = () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "No products selected",
        description: "Please select at least one product to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsPickingProducts(false);
    setImages(selectedProducts.map(product => ({
      id: product.id,
      url: product.image,
      selected: false,
    })));
    toast({
      title: "Products confirmed",
      description: `${selectedProducts.length} product(s) have been loaded.`,
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

  const handleAngleToggle = (angle: string) => {
    setSelectedAngles(prev => ({
      ...prev,
      [angle]: !prev[angle]
    }));
  };

  const getSelectedAnglesCount = () => {
    return Object.values(selectedAngles).filter(Boolean).length;
  };

  const getPrompt = () => {
    if (studioStyle.isCustomPrompt) {
      return customPrompt;
    }
    return `Product on a ${studioStyle.backgroundColor.toLowerCase()} studio background`;
  };

  const canStartGeneration = images.length > 0 && 
    images.some((img) => img.selected) && 
    (studioStyle.isCustomPrompt ? customPrompt.trim() : true) && 
    getSelectedAnglesCount() > 0;

  const handleStartGeneration = () => {
    if (canStartGeneration) {
      navigate("/generation-results", {
        state: {
          selectedProducts,
          selectedAngles: Object.entries(selectedAngles)
            .filter(([_, isSelected]) => isSelected)
            .map(([angle]) => angle)
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
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isPickingProducts ? (
          <div className="mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
              <CardHeader>
                <div className="flex flex-col-reverse md:grid md:grid-cols-[1fr,320px] gap-8 md:gap-0 items-start">
                  <div className="space-y-4 pr-8">
                    <h1 className="text-display-xl text-[#1A1F2C] tracking-tight">
                      Welcome to Stylizer
                    </h1>
                    <p className="text-body-lg text-[#6D7175] max-w-2xl">
                      Transform your product photos into professional lifestyle images using AI. 
                      Select up to 3 products to enhance their visual appeal together.
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-1 w-full">
                    {fashionImages.map((image, index) => (
                      <div 
                        key={index}
                        className="relative group overflow-hidden aspect-square"
                      >
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => {
                            console.error(`Failed to load image: ${image.src}`);
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {selectedProducts.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
                <CardHeader>
                  <h2 className="text-display-sm text-[#1A1F2C] tracking-tight">
                    Selected Products ({selectedProducts.length}/3)
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center p-4 border border-polaris-border rounded-md"
                      >
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-16 h-16 object-cover rounded-md"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                        <div className="ml-4 flex-1">
                          <h3 className="font-medium text-polaris-text">{product.title}</h3>
                          <p className="text-sm text-polaris-secondary">SKU: {product.sku}</p>
                        </div>
                        <button
                          onClick={() => handleProductRemove(product.id)}
                          className="ml-4 px-4 py-2 text-red-500 border border-red-500 rounded hover:bg-red-50 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <Button
                      onClick={handleConfirmSelection}
                      className="w-full bg-[#9b87f5] hover:bg-[#7E69AB] text-white font-medium px-6 py-2 rounded-lg transition-colors"
                    >
                      Confirm Selection (Max 3)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <ProductPicker 
              onSelect={handleProductSelect} 
              selectedProducts={selectedProducts}
            />
          </div>
        ) : (
          <div className="space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-display-sm text-[#1A1F2C]">Selected Products</span>
                    <button
                      onClick={() => setIsPickingProducts(true)}
                      className="text-polaris-teal hover:underline"
                    >
                      Edit Selection
                    </button>
                  </div>
                  <Separator className="mb-4" />
                  <h5 className="text-body-lg text-[#1A1F2C] tracking-tight">
                    Product Images
                  </h5>
                  <p className="text-body-md text-[#6D7175]">Select the product images to use for styling</p>
                </div>
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
                  Angle Selection
                </h2>
                <p className="text-body-md text-[#6D7175]">
                  Choose which angles to generate for your products
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(selectedAngles).map(([angle, isSelected]) => (
                    <Toggle
                      key={angle}
                      pressed={isSelected}
                      onPressedChange={() => handleAngleToggle(angle)}
                      className={`px-4 py-2 transition-all duration-200 relative ${
                        isSelected 
                          ? 'bg-white text-[#9b87f5] border-2 border-[#9b87f5] hover:bg-gray-50 pl-8' 
                          : 'bg-gray-100 text-[#1A1F2C] hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      {isSelected && (
                        <Check className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2" />
                      )}
                      {angle}
                    </Toggle>
                  ))}
                </div>
                {getSelectedAnglesCount() === 0 && (
                  <p className="mt-2 text-sm text-red-500">
                    Please select at least one angle
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <h2 className="text-display-md text-[#1A1F2C] tracking-tight">
                  Style Prompt
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant={!studioStyle.isCustomPrompt ? "default" : "outline"}
                      className="flex items-center space-x-2"
                      onClick={() => setStudioStyle(prev => ({ ...prev, isCustomPrompt: false }))}
                    >
                      <Wand2 className="h-4 w-4" />
                      <span>Studio Style</span>
                    </Button>
                    {!studioStyle.isCustomPrompt && (
                      <StudioColorPicker
                        color={studioStyle.backgroundColor}
                        onChange={(color) => setStudioStyle(prev => ({ ...prev, backgroundColor: color }))}
                      />
                    )}
                  </div>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={studioStyle.isCustomPrompt ? "default" : "outline"}
                        onClick={() => setStudioStyle(prev => ({ ...prev, isCustomPrompt: true }))}
                      >
                        Custom Prompt
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <Input
                        placeholder="Describe the style you want..."
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        className="mb-2"
                      />
                    </PopoverContent>
                  </Popover>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Final Prompt:</p>
                    <p className="text-sm font-medium">{getPrompt()}</p>
                  </div>

                  <Button
                    className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white font-medium px-6 py-2 rounded-lg transition-colors w-full"
                    disabled={!canStartGeneration}
                    onClick={handleStartGeneration}
                  >
                    Start Generation ({getSelectedAnglesCount()} angles selected)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
