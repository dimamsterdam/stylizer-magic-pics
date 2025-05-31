
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductPicker } from "@/components/ProductPicker";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, WandSparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { PhotoShootHeader } from "@/components/photoshoot/PhotoShootHeader";
import { PromptBuilder } from "@/components/expose/PromptBuilder";
import { ShotSuggestions } from "@/components/photoshoot/PromptSuggestions";
import { PhotoReviewPanel } from "@/components/photoshoot/PhotoReviewPanel";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";

interface Product {
  id: string;
  title: string;
  sku: string;
  image: string;
}

interface ProductView {
  viewName: string;
  variants: string[];
}

type ShootType = 'standard' | 'ai-suggestions';

// Mock images for the photo shoot with descriptive shot names
const mockProductViews = [
  {
    viewName: "Professional studio shot with neutral background highlighting product texture",
    variants: [
      "/lovable-uploads/products/cream-sweater/.gitkeep", 
      "/lovable-uploads/047c9307-af3c-47c6-b2e6-ea9d51a0c8cc.png"
    ]
  },
  {
    viewName: "Lifestyle shot showing product in natural daylight setting", 
    variants: [
      "/lovable-uploads/products/cream-button-up/.gitkeep", 
      "/lovable-uploads/0f0a212c-5edc-4c90-a258-6b43222bac06.png"
    ]
  },
  {
    viewName: "Close-up detail shot highlighting stitching and fabric quality", 
    variants: [
      "/lovable-uploads/12022501-6211-4169-ad19-4d93700c8c9f.png", 
      "/lovable-uploads/61d9b435-6552-49b0-a269-25c905ba18c9.png"
    ]
  },
  {
    viewName: "Model wearing product in urban environment for context", 
    variants: [
      "/lovable-uploads/85ad1b88-47a8-4226-bc2e-63fa2dcf049a.png", 
      "/lovable-uploads/9bac9fd0-2115-4bae-8108-0b973f83db37.png"
    ]
  }
];

const standardProductViews = [
  {
    viewName: "Front View",
    variants: [
      "/lovable-uploads/products/cream-sweater/.gitkeep", 
      "/lovable-uploads/047c9307-af3c-47c6-b2e6-ea9d51a0c8cc.png"
    ]
  },
  {
    viewName: "Side View", 
    variants: [
      "/lovable-uploads/products/cream-button-up/.gitkeep", 
      "/lovable-uploads/0f0a212c-5edc-4c90-a258-6b43222bac06.png"
    ]
  },
  {
    viewName: "Back View", 
    variants: [
      "/lovable-uploads/12022501-6211-4169-ad19-4d93700c8c9f.png", 
      "/lovable-uploads/61d9b435-6552-49b0-a269-25c905ba18c9.png"
    ]
  },
  {
    viewName: "Detail View", 
    variants: [
      "/lovable-uploads/85ad1b88-47a8-4226-bc2e-63fa2dcf049a.png", 
      "/lovable-uploads/9bac9fd0-2115-4bae-8108-0b973f83db37.png"
    ]
  }
];

const ProductPhotoShoot = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [finalPrompt, setFinalPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [shootType, setShootType] = useState<ShootType>('standard');
  const [generatedProductViews, setGeneratedProductViews] = useState<ProductView[]>([]);
  const [showShotSuggestions, setShowShotSuggestions] = useState(false);
  const [hasGeneratedPhotos, setHasGeneratedPhotos] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      shootType: 'standard'
    }
  });

  const { data: searchResults = [], isLoading, error } = useQuery({
    queryKey: ['products', searchTerm],
    queryFn: async () => {
      if (searchTerm.length < 2) return [];
      const { data, error } = await supabase
        .from('products')
        .select('id, title, sku, image_url')
        .ilike('title', `%${searchTerm}%`)
        .limit(10);
      if (error) throw error;
      return data.map(product => ({
        id: product.id,
        title: product.title,
        sku: product.sku || '',
        image: product.image_url || '/placeholder.svg'
      }));
    },
    enabled: searchTerm.length >= 2
  });

  const handleProductSelect = (product: Product) => {
    if (selectedProducts.length < 1) {
      setSelectedProducts([product]);
    } else {
      toast({
        title: "Product limit reached",
        description: "Photo shoot is limited to one product at a time",
        variant: "default"
      });
    }
  };

  const handleProductRemove = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handlePromptChange = (prompt: string) => {
    setFinalPrompt(prompt);
  };

  const handlePromptFinalize = (prompt: string) => {
    setFinalPrompt(prompt);
  };

  const handleGeneratePhotos = () => {
    const formShootType = form.getValues('shootType');
    setShootType(formShootType as ShootType);
    
    if (formShootType === 'standard') {
      // Generate standard shots
      setIsGenerating(true);
      setGeneratedProductViews(standardProductViews);
      
      setTimeout(() => {
        setIsGenerating(false);
        setHasGeneratedPhotos(true);
        toast({
          title: "Images generated",
          description: "Your standard product photos have been generated successfully!",
        });
      }, 2000);
    } else {
      // Show shot suggestions
      setShowShotSuggestions(true);
    }
  };

  const handlePromptsSelected = (selectedPrompts: string[]) => {
    setSelectedPrompts(selectedPrompts);
    
    const newProductViews = selectedPrompts.map((prompt, index) => {
      const mockIndex = index % mockProductViews.length;
      return {
        viewName: prompt,
        variants: mockProductViews[mockIndex].variants
      };
    });
    
    setGeneratedProductViews(newProductViews);
    setIsGenerating(true);
    
    setTimeout(() => {
      setIsGenerating(false);
      setHasGeneratedPhotos(true);
      setShowShotSuggestions(false);
      toast({
        title: "Images generated",
        description: "Your product photos have been generated successfully!",
      });
    }, 2000);
  };

  const canGeneratePhotos = selectedProducts.length > 0 && finalPrompt.trim();

  return (
    <div className="max-w-[99.8rem] mx-auto">
      <PhotoShootHeader />
      
      {/* Main Layout */}
      <div className="bg-[--p-background] min-h-[calc(100vh-129px)] flex">
        {/* Left Content Panel */}
        <div className="flex-1 mr-[400px] p-5 space-y-6">
          
          {/* Product Selection Section */}
          <Card className="bg-[--p-surface] shadow-sm border border-[#E3E5E7] rounded-md">
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-display-sm text-[--p-text] mb-1">Select Product</h2>
                <p className="text-body text-[--p-text-subdued]">
                  Choose a product for your photo shoot
                </p>
              </div>

              <ProductPicker 
                onSelect={handleProductSelect} 
                selectedProducts={selectedProducts} 
                searchResults={searchResults} 
                isLoading={isLoading} 
                error={error ? 'Error loading products' : null} 
                searchTerm={searchTerm} 
                onSearch={handleSearchChange} 
              />

              {selectedProducts.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-heading text-[--p-text] mb-3">
                    Selected Product
                  </h3>
                  <div className="space-y-3">
                    {selectedProducts.map(product => (
                      <div key={product.id} className="flex items-center p-4 border rounded-lg border-[#E3E5E7] bg-[--p-surface]">
                        <img 
                          src={product.image} 
                          alt={product.title} 
                          className="w-12 h-12 object-cover rounded" 
                          onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} 
                        />
                        <div className="ml-3 flex-1 min-w-0">
                          <h4 className="text-heading text-[--p-text] truncate">
                            {product.title}
                          </h4>
                          <p className="text-caption text-[--p-text-subdued]">SKU: {product.sku}</p>
                        </div>
                        <Button 
                          onClick={() => handleProductRemove(product.id)} 
                          variant="ghost" 
                          className="text-[--p-text-subdued] hover:text-[--p-text] hover:bg-[--p-surface-hovered]"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Design Brief Section */}
          {selectedProducts.length > 0 && (
            <Card className="bg-[--p-surface] shadow-sm border border-[#E3E5E7] rounded-md">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h2 className="text-display-sm text-[--p-text] mb-1">Design brief</h2>
                  <p className="text-body text-[--p-text-subdued]">Describe how you want your product to be photographed</p>
                </div>

                <PromptBuilder 
                  value={finalPrompt} 
                  onChange={handlePromptChange} 
                  onFinalize={handlePromptFinalize} 
                />

                <div className="space-y-6 mt-6 pt-6 border-t border-[#E3E5E7]">
                  <div>
                    <h3 className="text-heading text-[--p-text] mb-3">Setup your shoot</h3>
                    
                    <RadioGroup 
                      defaultValue="standard"
                      onValueChange={(value) => form.setValue('shootType', value)}
                    >
                      <div className="flex items-center space-x-2 p-3 rounded-md hover:bg-[#F6F6F7] cursor-pointer">
                        <RadioGroupItem value="standard" id="standard" />
                        <Label htmlFor="standard" className="font-medium cursor-pointer">
                          Standard product shoot (back, sides & front shots)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 rounded-md hover:bg-[#F6F6F7] cursor-pointer">
                        <RadioGroupItem value="ai-suggestions" id="ai-suggestions" />
                        <Label htmlFor="ai-suggestions" className="font-medium cursor-pointer">
                          Let the AI photographer suggest shots
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleGeneratePhotos} 
                    disabled={!canGeneratePhotos || isGenerating} 
                    variant="primary"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <WandSparkles className="mr-2 h-4 w-4" />
                        Generate Photos
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shot Suggestions Section */}
          {showShotSuggestions && selectedProducts.length > 0 && (
            <ShotSuggestions
              productName={selectedProducts[0].title}
              designBrief={finalPrompt}
              onContinue={handlePromptsSelected}
              productImage={selectedProducts[0].image}
            />
          )}
        </div>

        {/* Right Preview Panel */}
        <PhotoReviewPanel 
          selectedProduct={selectedProducts[0]}
          productViews={generatedProductViews}
          isGenerating={isGenerating}
          hasGeneratedPhotos={hasGeneratedPhotos}
        />
      </div>
    </div>
  );
};

export default ProductPhotoShoot;
