import { useState } from "react";
import { Search, Check, Wand2, Loader2 } from "lucide-react";
import { ProductPicker } from "@/components/ProductPicker";
import { ImageGallery } from "@/components/ImageGallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { StudioColorPicker } from "@/components/StudioColorPicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

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

interface ModelAttributes {
  gender: "Male" | "Female" | "Any";
  bodyType: "Slim" | "Athletic" | "Curvy" | "Plus Size";
  age: "18-25" | "25-35" | "35-45" | "45+";
  ethnicity: "Any" | "Asian" | "Black" | "Caucasian" | "Hispanic" | "Middle Eastern" | "Mixed";
  hairLength: "Short" | "Medium" | "Long";
  hairColor: "Black" | "Brown" | "Blonde" | "Red" | "Gray" | "Other";
  pose: "Natural" | "Professional" | "Casual" | "Dynamic";
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
  const [modelAttributes, setModelAttributes] = useState<ModelAttributes>({
    gender: "Any",
    bodyType: "Athletic",
    age: "25-35",
    ethnicity: "Any",
    hairLength: "Medium",
    hairColor: "Brown",
    pose: "Professional"
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [results, setResults] = useState<Product[]>([]);

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
      title: product.title,
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
    return `Studio style`;
  };

  const getFinalPrompt = () => {
    const basePrompt = `A ${modelAttributes.gender.toLowerCase()} fashion model with ${modelAttributes.bodyType.toLowerCase()} build, ${modelAttributes.hairLength.toLowerCase()} ${modelAttributes.hairColor.toLowerCase()} hair`;
    
    const ethnicityPart = modelAttributes.ethnicity !== "Any" 
      ? `, ${modelAttributes.ethnicity} ethnicity` 
      : "";
      
    const agePart = `, ${modelAttributes.age} years old`;
    
    const posePart = `, in a ${modelAttributes.pose.toLowerCase()} pose`;
    
    const stylePart = studioStyle.isCustomPrompt 
      ? customPrompt
      : "in a professional studio setting with clean lighting";

    return `${basePrompt}${ethnicityPart}${agePart}${posePart}, ${stylePart}`;
  };

  const canStartGeneration = images.length > 0 && 
    images.some((img) => img.selected) && 
    (studioStyle.isCustomPrompt ? customPrompt.trim().length > 0 : true) && 
    getSelectedAnglesCount() > 0 &&
    modelAttributes.gender !== 'Any' &&
    modelAttributes.bodyType !== 'Athletic' &&
    modelAttributes.age !== '25-35' &&
    modelAttributes.pose !== 'Professional';

  const handleStartGeneration = () => {
    if (canStartGeneration) {
      navigate("/generation-results", {
        state: {
          selectedProducts,
          selectedAngles: Object.entries(selectedAngles)
            .filter(([_, isSelected]) => isSelected)
            .map(([angle]) => angle),
          prompt: getFinalPrompt()
        }
      });
      toast({
        title: "Starting generation",
        description: "Your images are being generated...",
      });
    }
  };

  const searchProducts = async (term: string) => {
    if (term.length < 2) {
      setResults([]);
      return;
    }

    try {
      setIsLoading(true);
      setSearchError(null);
      console.log('Searching products with term:', term);

      const response = await supabase.functions.invoke('sync-shopify-products', {
        body: { searchTerm: term }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      console.log('Search response:', response.data);
      const formattedProducts = response.data.products.map(product => ({
        id: product.id,
        title: product.title,
        sku: product.sku || '',
        image: product.image_url || '',
      }));

      setResults(formattedProducts);
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchError('Failed to search products. Please try again.');
      toast({
        title: "Error",
        description: "Failed to search products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    searchProducts(term);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F6F7] to-[#E5DEFF]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isPickingProducts ? (
          <div className="mb-8 animate-fade-in">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8 transition-all duration-300 hover:shadow-xl">
              <CardHeader>
                <div className="flex flex-col-reverse md:grid md:grid-cols-[1fr,320px] gap-8 md:gap-0 items-start">
                  <div className="space-y-4 pr-8">
                    <h2 className="text-display-lg text-[#1A1F2C] tracking-tight">
                      Create AI-Generated Product Photos
                    </h2>
                    <p className="text-body-lg text-[#6D7175] max-w-2xl">
                      Transform your product photos into professional lifestyle images using AI. 
                      Select up to 3 products to enhance their visual appeal together.
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-1 w-full">
                    {fashionImages.map((image, index) => (
                      <div 
                        key={index}
                        className="relative group overflow-hidden aspect-square transition-transform duration-300 hover:scale-105"
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
              <CardContent>
                <div className="mt-8 border-t border-polaris-border pt-6">
                  <div className="relative max-w-2xl mx-auto">
                    {!isLoading && (
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-polaris-secondary" />
                    )}
                    {isLoading && (
                      <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-polaris-secondary animate-spin" />
                    )}
                    <Input
                      type="text"
                      placeholder="Search products by name or SKU (type at least 2 characters)"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 border-polaris-border bg-white/50 transition-all duration-300 focus:bg-white"
                      disabled={isLoading || selectedProducts.length >= 3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedProducts.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8 transition-all duration-300 hover:shadow-xl animate-fade-in">
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
                        className="flex items-center p-4 border border-polaris-border rounded-md bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70 hover:shadow-md animate-scale-in"
                      >
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-16 h-16 object-cover rounded-md transition-transform duration-300 hover:scale-105"
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
                          className="ml-4 px-4 py-2 text-red-500 border border-red-500 rounded hover:bg-red-50 transition-all duration-300"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <div className="flex justify-end">
                      <Button
                        onClick={handleConfirmSelection}
                        className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white font-medium px-6 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        Confirm Selection
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <ProductPicker 
              onSelect={handleProductSelect} 
              selectedProducts={selectedProducts}
              searchResults={results}
              isLoading={isLoading}
              error={searchError}
              searchTerm={searchTerm}
            />
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-display-lg text-[#1A1F2C] tracking-tight">
                    Define your 'photo shoot'
                  </h2>
                  <button
                    onClick={() => setIsPickingProducts(true)}
                    className="inline-flex items-center text-[#9b87f5] hover:text-[#7E69AB] transition-colors duration-300 text-body-md font-medium"
                  >
                    Edit Selection
                  </button>
                </div>
                <Separator className="mb-6" />
                <h3 className="text-display-md text-[#1A1F2C] tracking-tight mb-2">
                  Product Images
                </h3>
                <p className="text-body-lg text-[#6D7175]">
                  Select the product images to use for styling
                </p>
              </CardHeader>
              <CardContent>
                <ImageGallery
                  images={images}
                  onSelect={handleImageSelect}
                  onRemove={handleImageRemove}
                />
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardHeader>
                <h2 className="text-display-lg text-[#1A1F2C] tracking-tight mb-2">
                  Angle Selection
                </h2>
                <p className="text-body-lg text-[#6D7175]">
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
                      className={`px-4 py-2 transition-all duration-300 relative ${
                        isSelected 
                          ? 'bg-white text-[#9b87f5] border-2 border-[#9b87f5] hover:bg-gray-50 pl-8 shadow-md hover:shadow-lg' 
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

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardHeader>
                <h2 className="text-display-lg text-[#1A1F2C] tracking-tight mb-2">
                  Model Attributes
                </h2>
                <p className="text-body-lg text-[#6D7175]">
                  Customize the appearance of the fashion model
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <RadioGroup
                      value={modelAttributes.gender}
                      onValueChange={(value) => 
                        setModelAttributes(prev => ({ ...prev, gender: value as ModelAttributes["gender"] }))
                      }
                      className="flex gap-4"
                    >
                      {["Any", "Male", "Female"].map((gender) => (
                        <div key={gender} className="flex items-center space-x-2">
                          <RadioGroupItem value={gender} id={`gender-${gender}`} />
                          <Label htmlFor={`gender-${gender}`}>{gender}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Body Type</Label>
                      <Select
                        value={modelAttributes.bodyType}
                        onValueChange={(value) => 
                          setModelAttributes(prev => ({ ...prev, bodyType: value as ModelAttributes["bodyType"] }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["Slim", "Athletic", "Curvy", "Plus Size"].map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Age Range</Label>
                      <Select
                        value={modelAttributes.age}
                        onValueChange={(value) => 
                          setModelAttributes(prev => ({ ...prev, age: value as ModelAttributes["age"] }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["18-25", "25-35", "35-45", "45+"].map((age) => (
                            <SelectItem key={age} value={age}>{age}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Ethnicity</Label>
                      <Select
                        value={modelAttributes.ethnicity}
                        onValueChange={(value) => 
                          setModelAttributes(prev => ({ ...prev, ethnicity: value as ModelAttributes["ethnicity"] }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["Any", "Asian", "Black", "Caucasian", "Hispanic", "Middle Eastern", "Mixed"].map((ethnicity) => (
                            <SelectItem key={ethnicity} value={ethnicity}>{ethnicity}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Pose Style</Label>
                      <Select
                        value={modelAttributes.pose}
                        onValueChange={(value) => 
                          setModelAttributes(prev => ({ ...prev, pose: value as ModelAttributes["pose"] }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["Natural", "Professional", "Casual", "Dynamic"].map((pose) => (
                            <SelectItem key={pose} value={pose}>{pose}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Hair Length</Label>
                      <Select
                        value={modelAttributes.hairLength}
                        onValueChange={(value) => 
                          setModelAttributes(prev => ({ ...prev, hairLength: value as ModelAttributes["hairLength"] }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["Short", "Medium", "Long"].map((length) => (
                            <SelectItem key={length} value={length}>{length}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Hair Color</Label>
                      <Select
                        value={modelAttributes.hairColor}
                        onValueChange={(value) => 
                          setModelAttributes(prev => ({ ...prev, hairColor: value as ModelAttributes["hairColor"] }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["Black", "Brown", "Blonde", "Red", "Gray", "Other"].map((color) => (
                            <SelectItem key={color} value={color}>{color}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <h2 className="text-display-lg text-[#1A1F2C] tracking-tight mb-2">
                  Generate Images
                </h2>
                <p className="text-body-lg text-[#6D7175]">
                  Review your selections and start the generation process
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Final Prompt:</p>
                    <p className="text-sm font-medium">{getPrompt()}</p>
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button
                      className={`transition-all duration-300 ${
                        canStartGeneration
                          ? 'bg-[#9b87f5] hover:bg-[#7E69AB] text-white shadow-lg hover:shadow-xl hover:scale-105'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!canStartGeneration}
                      onClick={handleStartGeneration}
                    >
                      Start Generation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 text-polaris-text animate-spin" />
        </div>
      ) : null}
    </div>
  );
};

export default Index;
