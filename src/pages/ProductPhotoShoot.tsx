
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

interface Product {
  id: string;
  title: string;
  sku: string;
  image: string;
}

type Step = 'products' | 'theme-content' | 'review';
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
  
  const { toast } = useToast();
  const navigate = useNavigate();

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
      try {
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
      } catch (error) {
        console.error('Error generating images:', error);
        toast({
          title: "Error",
          description: "Failed to generate images. Please try again.",
          variant: "destructive"
        });
        setIsGenerating(false);
      }
    }
  };

  const handleStepClick = (step: Step) => {
    if (step === 'review' && currentStep !== 'review') return; // Only allow going to review if we've generated images
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

          <div className="flex justify-end pt-4">
            <Button 
              type="button" 
              onClick={handleContinue} 
              disabled={isGenerating || !finalPrompt.trim()} 
              variant="primary"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : 'Generate Photos'}
            </Button>
          </div>
        </CardContent>
      </Card>
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
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
};

export default ProductPhotoShoot;
