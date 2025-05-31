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
import { ShotSuggestions } from "@/components/photoshoot/PromptSuggestions";
import { PhotoReviewPanel } from "@/components/photoshoot/PhotoReviewPanel";
import { SessionRecovery } from "@/components/photoshoot/SessionRecovery";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { usePhotoShootSession } from "@/hooks/usePhotoShootSession";

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
  const [showShotSuggestions, setShowShotSuggestions] = useState(false);
  const [hasGeneratedPhotos, setHasGeneratedPhotos] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      shootType: 'standard' as ShootType
    }
  });

  // Session management
  const {
    sessions,
    currentSession,
    currentSessionId,
    sessionsLoading,
    generatedPhotos,
    productViews,
    createSession,
    updateSession,
    saveGeneratedPhotos,
    updatePhotoApproval,
    setCurrentSessionId,
    autoSave,
    isCreating,
    isUpdating,
    isSavingPhotos
  } = usePhotoShootSession();

  // Load session data when currentSession changes
  useEffect(() => {
    if (currentSession) {
      if (currentSession.product_id) {
        // Load product data
        loadProductData(currentSession.product_id);
      }
      
      setFinalPrompt(currentSession.design_brief || '');
      
      if (currentSession.status === 'reviewing' || currentSession.status === 'completed') {
        setHasGeneratedPhotos(true);
      }
    }
  }, [currentSession]);

  const loadProductData = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        const product = {
          id: data.id,
          title: data.title,
          sku: data.sku || '',
          image: data.image_url || '/placeholder.svg'
        };
        setSelectedProducts([product]);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    }
  };

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
      
      if (currentSessionId) {
        autoSave({ product_id: product.id });
      }
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
    
    if (currentSessionId) {
      autoSave({ product_id: null });
    }
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handlePromptChange = (prompt: string) => {
    setFinalPrompt(prompt);
    
    if (currentSessionId) {
      autoSave({ design_brief: prompt });
    }
  };

  const handlePromptFinalize = (prompt: string) => {
    setFinalPrompt(prompt);
    
    if (currentSessionId) {
      autoSave({ design_brief: prompt });
    }
  };

  const handleContinueSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    toast({
      title: "Session restored",
      description: "Your previous session has been restored",
    });
  };

  const handleStartNewSession = () => {
    if (!currentSessionId && selectedProducts.length > 0) {
      createSession({
        product_id: selectedProducts[0].id,
        design_brief: finalPrompt,
        status: 'draft'
      });
    } else {
      setSelectedProducts([]);
      setFinalPrompt('');
      setCurrentSessionId(null);
      setHasGeneratedPhotos(false);
      setShowShotSuggestions(false);
      form.reset();
    }
  };

  const handleGeneratePhotos = async () => {
    setShowShotSuggestions(true);
  };

  const handlePromptsSelected = async (selectedPrompts: string[]) => {
    setSelectedPrompts(selectedPrompts);
    
    if (currentSessionId) {
      updateSession({
        sessionId: currentSessionId,
        updates: {
          selected_prompts: selectedPrompts,
          status: 'generating'
        }
      });
    }
    
    const newProductViews = selectedPrompts.map((prompt, index) => {
      const mockIndex = index % mockProductViews.length;
      return {
        viewName: prompt,
        variants: mockProductViews[mockIndex].variants
      };
    });
    
    setIsGenerating(true);
    
    setTimeout(async () => {
      setIsGenerating(false);
      setHasGeneratedPhotos(true);
      setShowShotSuggestions(false);
      
      if (currentSessionId) {
        const photosToSave = newProductViews.flatMap(view => 
          view.variants.map((url, index) => ({
            view_name: view.viewName,
            variant_index: index,
            image_url: url,
            approval_status: 'pending' as const
          }))
        );
        
        saveGeneratedPhotos({
          sessionId: currentSessionId,
          photos: photosToSave
        });
        
        updateSession({
          sessionId: currentSessionId,
          updates: { status: 'reviewing' }
        });
      }
      
      toast({
        title: "Images generated",
        description: "Your product photos have been generated successfully!",
      });
    }, 2000);
  };

  const handleApprovePhoto = (photoId: string) => {
    updatePhotoApproval({ photoId, status: 'approved' });
  };

  const handleRejectPhoto = (photoId: string) => {
    updatePhotoApproval({ photoId, status: 'rejected' });
  };

  const handleUnapprovePhoto = (photoId: string) => {
    updatePhotoApproval({ photoId, status: 'pending' });
  };

  const canGeneratePhotos = selectedProducts.length > 0 && finalPrompt.trim();

  return (
    <div className="max-w-[99.8rem] mx-auto">
      <PhotoShootHeader />
      
      <div className="bg-[--p-background] min-h-[calc(100vh-129px)] flex">
        <div className="flex-1 mr-[400px] p-5 space-y-6">
          
          <SessionRecovery
            sessions={sessions}
            onContinueSession={handleContinueSession}
            onStartNew={handleStartNewSession}
            isLoading={sessionsLoading}
          />
          
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
        </div>

        <PhotoReviewPanel 
          productViews={productViews}
          generatedPhotos={generatedPhotos}
          isGenerating={isGenerating}
          hasGeneratedPhotos={hasGeneratedPhotos}
          onApprovePhoto={handleApprovePhoto}
          onRejectPhoto={handleRejectPhoto}
          onUnapprovePhoto={handleUnapprovePhoto}
          showShotSuggestions={showShotSuggestions}
          productName={selectedProducts[0]?.title}
          designBrief={finalPrompt}
          onPromptsSelected={handlePromptsSelected}
        />
      </div>
    </div>
  );
};

export default ProductPhotoShoot;
