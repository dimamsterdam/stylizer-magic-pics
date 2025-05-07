import React, { useState, useEffect } from "react";
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
import { ImageReviewGallery } from "@/components/photoshoot/ImageReviewGallery";
import { ShotSuggestions } from "@/components/photoshoot/PromptSuggestions";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface Product {
  id: string;
  title: string;
  sku: string;
  image: string;
}

type Step = 'products' | 'theme-content' | 'prompt-suggestions' | 'review';
type ShootType = 'standard' | 'ai-suggestions';
const PLACEHOLDER_IMAGE = '/placeholder.svg';

// Mock images for the photo shoot
const mockProductViews = [
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
  const [currentStep, setCurrentStep] = useState<Step>('products');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [finalPrompt, setFinalPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [photoShootId, setPhotoShootId] = useState<string | null>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [shootType, setShootType] = useState<ShootType>('standard');
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      shootType: 'standard'
    }
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to create photo shoots",
          variant: "destructive"
        });
        navigate('/auth', { state: { returnUrl: '/product-photo-shoot' } });
      }
    };
    checkAuth();
  }, [navigate, toast]);

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
      setSelectedProducts(prev => [...prev, product]);
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
  
  const handleContinue = async () => {
    if (currentStep === 'products' && selectedProducts.length === 0) return;
    if (currentStep === 'theme-content' && !finalPrompt.trim()) return;
    
    if (currentStep === 'products') {
      try {
        // In a real implementation, we would save the photo shoot to the database
        setCurrentStep('theme-content');
      } catch (error) {
        console.error('Error creating photo shoot:', error);
        toast({
          title: "Error",
          description: "Failed to create photo shoot. Please try again.",
          variant: "destructive"
        });
      }
    } else if (currentStep === 'theme-content') {
      const formShootType = form.getValues('shootType');
      setShootType(formShootType as ShootType);
      
      if (formShootType === 'standard') {
        // Skip to review with standard shots
        setIsGenerating(true);
        
        // Simulate API call delay
        setTimeout(() => {
          setIsGenerating(false);
          setCurrentStep('review');
          toast({
            title: "Images generated",
            description: "Your standard product photos have been generated successfully!",
          });
        }, 2000);
      } else {
        // Go to shot suggestions
        setCurrentStep('prompt-suggestions');
      }
    }
  };

  const handlePromptsSelected = (selectedPrompts: string[]) => {
    setSelectedPrompts(selectedPrompts);
    
    // Simulate image generation
    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsGenerating(false);
      setCurrentStep('review');
      toast({
        title: "Images generated",
        description: "Your product photos have been generated successfully!",
      });
    }, 2000);
  };

  const handleStepClick = (step: Step) => {
    if (step === 'review' && currentStep !== 'review') return; // Only allow going to review if we've generated images
    if (step === 'prompt-suggestions' && currentStep === 'products') return; // Don't skip the theme-content step
    setCurrentStep(step);
  };

  const renderProductsStep = () => {
    return (
      <Card className="bg-[--p-surface] shadow-sm border border-[#E3E5E7] rounded-md">
        <CardContent className="p-6 space-y-6">
          <div className="mt-4">
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
            <div className="mt-8">
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

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleContinue} 
              disabled={selectedProducts.length === 0} 
              variant="primary"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderThemeContentStep = () => {
    return (
      <Card className="bg-[--p-surface] shadow-sm border border-[#E3E5E7] rounded-md">
        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="text-display-sm text-[--p-text] mb-1">Design brief</h2>
            <p className="text-body text-[--p-text-subdued]">Describe how you want your product to be photographed</p>
          </div>

          <div className="space-y-5">
            <PromptBuilder 
              value={finalPrompt} 
              onChange={handlePromptChange} 
              onFinalize={handlePromptFinalize} 
            />
          </div>

          <div className="space-y-6 mt-6 pt-6 border-t border-[#E3E5E7]">
            <div>
              <h3 className="text-heading text-[--p-text] mb-3">Setup your shoot</h3>
              
              <form onSubmit={form.handleSubmit(() => {})}>
                <div className="space-y-4">
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
              </form>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              type="button" 
              onClick={handleContinue} 
              disabled={!finalPrompt.trim()} 
              variant="primary"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPromptSuggestionsStep = () => {
    const productName = selectedProducts.length > 0 ? selectedProducts[0].title : 'product';
    
    return (
      <ShotSuggestions
        productName={productName}
        designBrief={finalPrompt}
        onContinue={handlePromptsSelected}
      />
    );
  };

  const renderReviewStep = () => {
    return (
      <ImageReviewGallery productViews={mockProductViews} />
    );
  };

  const renderMainContent = () => {
    switch (currentStep) {
      case 'products':
        return renderProductsStep();
      case 'theme-content':
        return renderThemeContentStep();
      case 'prompt-suggestions':
        return renderPromptSuggestionsStep();
      case 'review':
        return renderReviewStep();
      default:
        return null;
    }
  };

  return (
    <div className="max-w-[99.8rem] mx-auto">
      <PhotoShootHeader currentStep={currentStep} onStepClick={handleStepClick} />
      <div className="bg-[--p-background] min-h-[calc(100vh-129px)]">
        <div className="p-5">
          {isGenerating ? (
            <Card className="bg-[--p-surface] shadow-sm border border-[#E3E5E7] rounded-md">
              <CardContent className="p-12 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C6ECB] mb-4"></div>
                <h2 className="text-xl font-medium text-[--p-text] mb-2">Generating your photos</h2>
                <p className="text-[--p-text-subdued] text-center max-w-lg">
                  Our AI is creating professional product photos based on your specifications. 
                  This may take a moment...
                </p>
              </CardContent>
            </Card>
          ) : (
            renderMainContent()
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPhotoShoot;
