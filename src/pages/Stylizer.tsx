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
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { ModelPromptBuilder } from "@/components/ModelPromptBuilder";

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
  type: 'studio' | 'custom';
  backgroundColor: string;
  customPrompt: string;
}

interface ModelAttributes {
  gender: "Male" | "Female";
  bodyType: "Slim" | "Athletic" | "Curvy" | "Plus Size";
  age: "18-25" | "25-35" | "35-45" | "45+";
  ethnicity: "Asian" | "Black" | "Caucasian" | "Hispanic" | "Middle Eastern" | "Mixed";
  hairLength: "Short" | "Medium" | "Long";
  hairColor: "Black" | "Brown" | "Blonde" | "Red" | "Gray" | "Other";
  pose: "Natural" | "Professional" | "Casual" | "Dynamic";
  style: "authentic" | "amateur" | "polished" | "rock star" | "vogue";
}

const fashionImages = [{
  src: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
  alt: "Fashion model in urban setting"
}, {
  src: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
  alt: "Street fashion portrait"
}, {
  src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
  alt: "Fashion shopping"
}, {
  src: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80",
  alt: "Fashion editorial"
}, {
  src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
  alt: "Model in modern outfit"
}, {
  src: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=800&q=80",
  alt: "Contemporary fashion"
}, {
  src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80",
  alt: "Street style fashion"
}, {
  src: "https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=800&q=80",
  alt: "Fashion lifestyle"
}];

const DEFAULT_ANGLES = {
  "Front View": true,
  "Back View": true,
  "Side View": true,
  "Full Body": true
};

const Stylizer = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isPickingProducts, setIsPickingProducts] = useState(true);
  const [selectedAngles, setSelectedAngles] = useState<AnglePreferences>(DEFAULT_ANGLES);
  const [studioStyle, setStudioStyle] = useState<StudioStyle>({
    type: 'studio',
    backgroundColor: "#FFFFFF",
    customPrompt: ""
  });
  const [modelAttributes, setModelAttributes] = useState<ModelAttributes>({
    gender: "Female",
    bodyType: "Athletic",
    age: "25-35",
    ethnicity: "Caucasian",
    hairLength: "Medium",
    hairColor: "Brown",
    pose: "Professional",
    style: "polished"
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
        variant: "destructive"
      });
      return;
    }
    if (selectedProducts.some(p => p.id === product.id)) {
      toast({
        title: "Product already selected",
        description: "This product is already in your selection.",
        variant: "destructive"
      });
      return;
    }
    const updatedProducts = [...selectedProducts, product];
    setSelectedProducts(updatedProducts);
    toast({
      title: "Product added",
      description: `${product.title} has been added to your selection.`
    });
  };

  const handleProductRemove = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    toast({
      title: "Product removed",
      description: "Product has been removed from your selection."
    });
  };

  const handleConfirmSelection = () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "No products selected",
        description: "Please select at least one product to continue.",
        variant: "destructive"
      });
      return;
    }
    setIsPickingProducts(false);
    setImages(selectedProducts.map(product => ({
      id: product.id,
      url: product.image,
      selected: false,
      title: product.title
    })));
    toast({
      title: "Products confirmed",
      description: `${selectedProducts.length} product(s) have been loaded.`
    });
  };

  const handleImageSelect = (id: string) => {
    setImages(images.map(img => img.id === id ? {
      ...img,
      selected: !img.selected
    } : img));
  };

  const handleImageRemove = (id: string) => {
    setImages(images.filter(img => img.id !== id));
    toast({
      title: "Image removed",
      description: "The image has been removed from selection."
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
    if (studioStyle.type === 'custom' && studioStyle.customPrompt) {
      return studioStyle.customPrompt;
    }
    return `Professional studio setting with ${studioStyle.backgroundColor} background`;
  };

  const getFinalPrompt = () => {
    const basePrompt = `A ${modelAttributes.gender.toLowerCase()} fashion model with ${modelAttributes.bodyType.toLowerCase()} build, ${modelAttributes.hairLength.toLowerCase()} ${modelAttributes.hairColor.toLowerCase()} hair`;
    const ethnicityPart = modelAttributes.ethnicity ? `, ${modelAttributes.ethnicity} ethnicity` : "";
    const agePart = `, ${modelAttributes.age} years old`;
    const posePart = `, in a ${modelAttributes.pose.toLowerCase()} pose`;
    const stylePart = studioStyle.type === 'custom' ? studioStyle.customPrompt : `in a professional studio setting with Background Color: ${studioStyle.backgroundColor}`;
    return `${basePrompt}${ethnicityPart}${agePart}${posePart}, ${stylePart}`;
  };

  const canStartGeneration = images.length > 0 && images.some(img => img.selected) && getSelectedAnglesCount() > 0 && (studioStyle.type === 'studio' || studioStyle.type === 'custom' && studioStyle.customPrompt.trim().length > 0);

  const handleStartGeneration = () => {
    if (canStartGeneration) {
      navigate("/generation-results", {
        state: {
          selectedProducts,
          selectedAngles: Object.entries(selectedAngles).filter(([_, isSelected]) => isSelected).map(([angle]) => angle),
          prompt: getFinalPrompt()
        }
      });
      toast({
        title: "Starting generation",
        description: "Your images are being generated..."
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
        body: {
          searchTerm: term
        }
      });
      if (response.error) {
        throw new Error(response.error.message);
      }
      console.log('Search response:', response.data);
      const formattedProducts = response.data.products.map(product => ({
        id: product.id,
        title: product.title,
        sku: product.sku || '',
        image: product.image_url || ''
      }));
      setResults(formattedProducts);
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchError('Failed to search products. Please try again.');
      toast({
        title: "Error",
        description: "Failed to search products. Please try again.",
        variant: "destructive"
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
    <div className="h-full w-full pt-4">
      {isPickingProducts ? (
        <div className="p-4 sm:p-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="p-6 pb-0">
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="flex-1 min-w-0">
                  <h1 className="text-display-lg text-polaris-text tracking-tight mb-1">
                    Improve Your Pack Shots
                  </h1>
                  <p className="text-polaris-secondary text-body-md">
                    Transform your product photos into professional lifestyle images using AI. 
                    Select up to 3 products to enhance their visual appeal together and publish directly to Shopify.
                  </p>
                </div>
                <div className="w-full lg:w-[320px] shrink-0">
                  <div className="grid grid-cols-4 gap-1">
                    {fashionImages.slice(0, 8).map((image, index) => (
                      <div key={index} className="relative group aspect-square overflow-hidden rounded">
                        <img 
                          src={image.src} 
                          alt={image.alt} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mt-4">
                <ProductPicker 
                  onSelect={handleProductSelect} 
                  selectedProducts={selectedProducts} 
                  searchResults={results} 
                  isLoading={isLoading} 
                  error={searchError} 
                  searchTerm={searchTerm} 
                  onSearch={handleSearch} 
                />
              </div>
            </CardContent>
          </Card>

          {selectedProducts.length > 0 && (
            <Card className="mt-4 border-0 shadow-sm">
              <CardHeader className="p-6 pb-2">
                <h2 className="text-display-md text-polaris-text mb-1">
                  Selected Products ({selectedProducts.length}/3)
                </h2>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  {selectedProducts.map(product => (
                    <div key={product.id} 
                      className="flex items-center p-4 border rounded-lg bg-white/50 transition-all duration-300 hover:bg-white/70">
                      <img 
                        src={product.image} 
                        alt={product.title} 
                        className="w-16 h-16 object-cover rounded-md"
                        onError={e => { e.currentTarget.src = '/placeholder.svg'; }}
                      />
                      <div className="ml-4 flex-1 min-w-0">
                        <h3 className="text-body-md font-medium text-polaris-text truncate">
                          {product.title}
                        </h3>
                        <p className="text-body-sm text-polaris-secondary">
                          SKU: {product.sku}
                        </p>
                      </div>
                      <Button 
                        onClick={() => handleProductRemove(product.id)}
                        variant="ghost"
                        className="text-polaris-secondary hover:text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleConfirmSelection} 
                      disabled={selectedProducts.length === 0}
                      className="bg-polaris-text hover:bg-black text-white"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="p-4 sm:p-6">
          <div className="mb-6">
            <h2 className="text-polaris-text text-2xl font-medium">Define your photo shoot</h2>
            <p className="text-polaris-secondary mt-1">Configure all aspects of your AI-powered product photo shoot</p>
          </div>
          <div className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="p-6 pb-2">
                <div className="flex items-center justify-between">
                  <button onClick={() => setIsPickingProducts(true)} className="text-polaris-green hover:text-polaris-teal font-medium">
                    Edit Selection
                  </button>
                </div>
                <Separator className="my-4" />
                <h3 className="text-lg font-semibold text-polaris-text mb-1">Product Images</h3>
                <p className="text-polaris-secondary">Select the product images to use for styling</p>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <ImageGallery images={images} onSelect={handleImageSelect} onRemove={handleImageRemove} />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="p-6 pb-2">
                <h2 className="text-xl font-semibold text-polaris-text mb-1">Define the fashion model</h2>
                <p className="text-polaris-secondary">Describe your ideal model by clicking on any attribute to customize it</p>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <ModelPromptBuilder attributes={modelAttributes} onChange={(key, value) => setModelAttributes(prev => ({
                  ...prev,
                  [key]: value
                }))} />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="p-6 pb-2">
                <h2 className="text-xl font-semibold text-polaris-text mb-1">Selected Angles</h2>
                <p className="text-polaris-secondary">Choose which angles to generate for your products</p>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedAngles).map(([angle, isSelected]) => (
                    <Toggle 
                      key={angle} 
                      pressed={isSelected} 
                      onPressedChange={() => handleAngleToggle(angle)} 
                      className={`transition-all duration-300 ${isSelected ? 'bg-white text-polaris-green border-2 border-polaris-green hover:bg-gray-50 pl-8 shadow-sm' : 'bg-gray-100 text-polaris-text hover:bg-gray-200 border-2 border-transparent'}`}
                    >
                      {isSelected && <Check className="h-4 w-4 absolute left-2" />}
                      {angle}
                    </Toggle>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="p-6 pb-2">
                <h2 className="text-xl font-semibold text-polaris-text mb-1">Define Style</h2>
                <p className="text-polaris-secondary">Choose your desired background setting or color</p>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-6">
                  <RadioGroup 
                    value={studioStyle.type} 
                    onValueChange={(value: 'studio' | 'custom') => {
                      setStudioStyle(prev => ({
                        ...prev,
                        type: value
                      }));
                    }} 
                    className="flex flex-col space-y-4"
                  >
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:border-polaris-green transition-colors">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="studio" id="studio" />
                        <Label htmlFor="studio">Studio Setting</Label>
                        {studioStyle.type === 'studio' && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="ml-4 relative pl-10">
                                <div 
                                  className="w-6 h-6 rounded-full absolute left-2 border-2 border-gray-300" 
                                  style={{ backgroundColor: studioStyle.backgroundColor }} 
                                />
                                Choose Studio Background
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <StudioColorPicker 
                                color={studioStyle.backgroundColor} 
                                onChange={color => setStudioStyle(prev => ({
                                  ...prev,
                                  backgroundColor: color
                                }))} 
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg hover:border-polaris-green transition-colors">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="custom" />
                        <Label htmlFor="custom">Custom Prompt</Label>
                      </div>
                      {studioStyle.type === 'custom' && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="ml-4">
                              {studioStyle.customPrompt ? 'Edit Prompt' : 'Add Prompt'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Custom Studio Prompt</Label>
                                <div className="flex space-x-2">
                                  <Input 
                                    value={studioStyle.customPrompt} 
                                    onChange={e => setStudioStyle(prev => ({
                                      ...prev,
                                      customPrompt: e.target.value
                                    }))} 
                                    placeholder="Describe your desired studio setting..." 
                                  />
                                  <Button onClick={e => {
                                    const popoverElement = e.currentTarget.closest('[data-radix-popper-content-wrapper]');
                                    if (popoverElement instanceof HTMLElement) {
                                      popoverElement.style.display = 'none';
                                    }
                                  }}>
                                    Save
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </RadioGroup>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-polaris-secondary">Selected Style:</p>
                    <p className="text-sm mt-1 text-polaris-text">
                      {studioStyle.type === 'studio' ? `Studio setting with ${studioStyle.backgroundColor} background` : studioStyle.customPrompt || 'No custom prompt set'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="p-6 pb-2">
                <h2 className="text-xl font-semibold text-polaris-text mb-1">Final Prompt</h2>
                <p className="text-polaris-secondary">Adjust by changing the values above</p>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  <div className="bg-[#FEF7CD] p-6 rounded-lg border-l-4 border-polaris-green">
                    <p className="text-polaris-text">{getFinalPrompt()}</p>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      className={`transition-all duration-300 ${canStartGeneration ? 'bg-polaris-green hover:bg-polaris-teal text-white shadow-sm' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`} 
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
        </div>
      )}
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 text-polaris-secondary animate-spin" />
        </div>
      )}
    </div>
  );
};

export default Stylizer;
