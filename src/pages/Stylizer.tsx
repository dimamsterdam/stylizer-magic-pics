import { useState } from "react";
import { Search, Check, Wand2, Loader2, ArrowLeft } from "lucide-react";
import { ProductPicker } from "@/components/ProductPicker";
import { ImageGallery } from "@/components/ImageGallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, Link } from "react-router-dom";
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
    <div className="min-h-screen bg-[#F6F6F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#E3E5E7] sticky top-16 z-40">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center text-[#303030] hover:text-[#008060]">
                <ArrowLeft className="h-5 w-5" />
                <span className="ml-2 text-sm font-medium">Back to dashboard</span>
              </Link>
              <h1 className="text-lg font-medium text-[#303030]">
                {isPickingProducts ? "Add products" : "Configure generation"}
              </h1>
            </div>
            {!isPickingProducts && (
              <Button
                onClick={handleStartGeneration}
                disabled={!canStartGeneration}
                className="bg-[#008060] hover:bg-[#006e52] text-white px-6"
              >
                Start Generation
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-4">
            {isPickingProducts ? (
              <>
                <Card className="border border-[#E3E5E7] shadow-sm bg-white">
                  <CardHeader className="p-4 pb-2">
                    <h2 className="text-base font-medium text-[#303030]">
                      Product Selection
                    </h2>
                    <p className="text-sm text-[#616161] mt-1">
                      Select up to 3 products to enhance their visual appeal together
                    </p>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ProductPicker
                      onSelect={handleProductSelect}
                      selectedProducts={selectedProducts}
                      searchResults={results}
                      isLoading={isLoading}
                      error={searchError}
                      searchTerm={searchTerm}
                      onSearch={handleSearch}
                    />
                  </CardContent>
                </Card>

                {selectedProducts.length > 0 && (
                  <Card className="border border-[#E3E5E7] shadow-sm bg-white">
                    <CardHeader className="p-4 pb-2">
                      <h2 className="text-base font-medium text-[#303030]">
                        Selected Products ({selectedProducts.length}/3)
                      </h2>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {selectedProducts.map(product => (
                          <div key={product.id} 
                               className="flex items-center p-3 border rounded-lg border-[#E3E5E7] bg-white">
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-12 h-12 object-cover rounded"
                              onError={e => { e.currentTarget.src = '/placeholder.svg' }}
                            />
                            <div className="ml-3 flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-[#303030] truncate">
                                {product.title}
                              </h3>
                              <p className="text-xs text-[#616161]">SKU: {product.sku}</p>
                            </div>
                            <Button
                              onClick={() => handleProductRemove(product.id)}
                              variant="ghost"
                              className="text-[#616161] hover:text-red-600 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <div className="flex justify-end">
                          <Button
                            onClick={handleConfirmSelection}
                            className="bg-[#008060] hover:bg-[#006e52] text-white"
                          >
                            Continue with Selection
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <Card className="border border-[#E3E5E7] shadow-sm bg-white">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-medium text-[#303030]">Product Images</h2>
                      <Button
                        onClick={() => setIsPickingProducts(true)}
                        variant="ghost"
                        className="text-[#008060] hover:bg-[#F6F6F7]"
                      >
                        Edit Selection
                      </Button>
                    </div>
                    <p className="text-sm text-[#616161] mt-1">
                      Select the product images to use for styling
                    </p>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ImageGallery
                      images={images}
                      onSelect={handleImageSelect}
                      onRemove={handleImageRemove}
                    />
                  </CardContent>
                </Card>

                <Card className="border border-[#E3E5E7] shadow-sm bg-white">
                  <CardHeader className="p-4 pb-2">
                    <h2 className="text-base font-medium text-[#303030]">Model Attributes</h2>
                    <p className="text-sm text-[#616161] mt-1">
                      Customize your ideal model's characteristics
                    </p>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ModelPromptBuilder
                      attributes={modelAttributes}
                      onChange={(key, value) => setModelAttributes(prev => ({
                        ...prev,
                        [key]: value
                      }))}
                    />
                  </CardContent>
                </Card>

                <Card className="border border-[#E3E5E7] shadow-sm bg-white">
                  <CardHeader className="p-4 pb-2">
                    <h2 className="text-base font-medium text-[#303030]">Selected Angles</h2>
                    <p className="text-sm text-[#616161] mt-1">
                      Choose which angles to generate
                    </p>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedAngles).map(([angle, isSelected]) => (
                        <Toggle
                          key={angle}
                          pressed={isSelected}
                          onPressedChange={() => handleAngleToggle(angle)}
                          className={`text-sm ${
                            isSelected
                              ? 'bg-[#F6F6F7] text-[#008060] border border-[#008060] hover:bg-[#F6F6F7]'
                              : 'bg-white text-[#303030] border border-[#E3E5E7] hover:bg-[#F6F6F7]'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 mr-1" />}
                          {angle}
                        </Toggle>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-[#E3E5E7] shadow-sm bg-white">
                  <CardHeader className="p-4 pb-2">
                    <h2 className="text-base font-medium text-[#303030]">Background Style</h2>
                    <p className="text-sm text-[#616161] mt-1">
                      Define the background setting
                    </p>
                  </CardHeader>
                  <CardContent className="p-4">
                    <RadioGroup
                      value={studioStyle.type}
                      onValueChange={(value: 'studio' | 'custom') => {
                        setStudioStyle(prev => ({
                          ...prev,
                          type: value
                        }));
                      }}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2 p-3 border rounded-lg border-[#E3E5E7] hover:border-[#008060]">
                        <RadioGroupItem value="studio" id="studio" />
                        <Label htmlFor="studio" className="text-sm text-[#303030]">Studio Setting</Label>
                        {studioStyle.type === 'studio' && (
                          <div className="ml-auto">
                            <StudioColorPicker
                              color={studioStyle.backgroundColor}
                              onChange={color => setStudioStyle(prev => ({
                                ...prev,
                                backgroundColor: color
                              }))}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 p-3 border rounded-lg border-[#E3E5E7] hover:border-[#008060]">
                        <RadioGroupItem value="custom" id="custom" />
                        <Label htmlFor="custom" className="text-sm text-[#303030]">Custom Setting</Label>
                        {studioStyle.type === 'custom' && (
                          <Input
                            value={studioStyle.customPrompt}
                            onChange={e => setStudioStyle(prev => ({
                              ...prev,
                              customPrompt: e.target.value
                            }))}
                            placeholder="Describe your desired setting..."
                            className="ml-auto w-2/3 text-sm"
                          />
                        )}
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border border-[#E3E5E7] shadow-sm bg-white sticky top-32">
              <CardHeader className="p-4 pb-2">
                <h2 className="text-base font-medium text-[#303030]">Generation Summary</h2>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-[#616161]">Selected Products</label>
                    <p className="text-sm text-[#303030] mt-1">
                      {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                  {!isPickingProducts && (
                    <>
                      <div>
                        <label className="text-sm text-[#616161]">Selected Angles</label>
                        <p className="text-sm text-[#303030] mt-1">
                          {getSelectedAnglesCount()} angle{getSelectedAnglesCount() !== 1 ? 's' : ''} selected
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-[#616161]">Background</label>
                        <p className="text-sm text-[#303030] mt-1">
                          {studioStyle.type === 'studio' ? 'Studio setting' : 'Custom setting'}
                        </p>
                      </div>
                      <div className="bg-[#F6F6F7] p-3 rounded-lg">
                        <label className="text-sm text-[#616161]">Final Prompt Preview</label>
                        <p className="text-sm text-[#303030] mt-1 line-clamp-4">
                          {getFinalPrompt()}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-2">
            <Loader2 className="h-5 w-5 text-[#008060] animate-spin" />
            <span className="text-sm text-[#303030]">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stylizer;
