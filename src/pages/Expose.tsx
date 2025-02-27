
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExposeHeader } from '@/components/expose/ExposeHeader';
import { PreviewPanel } from '@/components/expose/PreviewPanel';
import { ProductPicker } from '@/components/ProductPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ThemeSelector } from '@/components/ThemeSelector';

// Use the correct step type based on ExposeHeader
type ExposeStep = 'products' | 'theme-content';

const Expose = () => {
  const { id: urlExposeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // State management
  const [exposeId, setExposeId] = useState<string | null>(urlExposeId || null);
  const [currentStep, setCurrentStep] = useState<ExposeStep>('products');
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [headline, setHeadline] = useState<string>('');
  const [bodyCopy, setBodyCopy] = useState<string>('');
  const [themeDescription, setThemeDescription] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [isPreviewExpanded, setIsPreviewExpanded] = useState<boolean>(false);
  const [panelState, setPanelState] = useState<'minimized' | 'preview' | 'expanded'>('minimized');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [imageGenerated, setImageGenerated] = useState<boolean>(false);
  
  // Fetch expose data
  const { 
    data: exposeData,
    isLoading,
    refetch: refetchExpose
  } = useQuery({
    queryKey: ['expose', exposeId],
    queryFn: async () => {
      if (!exposeId) return null;
      const { data, error } = await supabase
        .from('exposes')
        .select('*, expose_localizations(*)')
        .eq('id', exposeId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!exposeId
  });
  
  // Create a new expose if none exists
  const createExpose = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('exposes')
        .insert([{ 
          status: 'draft',
          user_id: 'user-123', // Replace with actual user ID from auth
          selected_product_ids: []
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setExposeId(data.id);
      navigate(`/expose/${data.id}`, { replace: true });
    }
  });
  
  // Initialize expose
  useEffect(() => {
    if (!urlExposeId) {
      createExpose.mutate();
    }
  }, [urlExposeId]);
  
  // Update state from fetched data
  useEffect(() => {
    if (exposeData) {
      // Set headline and body copy
      setHeadline(exposeData.headline || '');
      setBodyCopy(exposeData.body_copy || '');
      
      // Set theme
      setSelectedTheme(exposeData.theme || '');
      setThemeDescription(exposeData.theme_description || '');
      
      // Check if image is generated
      if (exposeData.hero_image_url || 
          (exposeData.image_variations && 
           Array.isArray(exposeData.image_variations) && 
           exposeData.image_variations.length > 0)) {
        setImageGenerated(true);
      }
      
      // Fetch selected products
      if (exposeData.selected_product_ids && Array.isArray(exposeData.selected_product_ids)) {
        fetchSelectedProducts(exposeData.selected_product_ids);
      }
    }
  }, [exposeData]);

  // Fetch products data
  const fetchSelectedProducts = async (productIds: string[]) => {
    if (!productIds.length) {
      setSelectedProducts([]);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);
      
      if (error) throw error;
      
      if (data) {
        // Ensure products are in the same order as selected_product_ids
        const orderedProducts = productIds.map(id => 
          data.find(product => product.id === id)
        ).filter(Boolean);
        
        setSelectedProducts(orderedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch selected products.",
        variant: "destructive"
      });
    }
  };
  
  // Handle step navigation
  const handleStepClick = (step: ExposeStep) => {
    setCurrentStep(step);
  };
  
  // Update selected products
  const handleProductSelect = async (products: any[]) => {
    if (!exposeId) return;
    
    try {
      const productIds = products.map(product => product.id);
      
      const { error } = await supabase
        .from('exposes')
        .update({ selected_product_ids: productIds })
        .eq('id', exposeId);
      
      if (error) throw error;
      
      setSelectedProducts(products);
      queryClient.invalidateQueries({ queryKey: ['expose', exposeId] });
      
      toast({
        title: "Success",
        description: "Products updated successfully!"
      });
    } catch (error) {
      console.error('Error updating products:', error);
      toast({
        title: "Error",
        description: "Failed to update products.",
        variant: "destructive"
      });
    }
  };
  
  // Update theme
  const handleThemeSelect = async (themeId: string, styleGuide: string) => {
    if (!exposeId) return;
    
    try {
      const { error } = await supabase
        .from('exposes')
        .update({ theme: themeId, theme_description: styleGuide })
        .eq('id', exposeId);
      
      if (error) throw error;
      
      setSelectedTheme(themeId);
      setThemeDescription(styleGuide);
      queryClient.invalidateQueries({ queryKey: ['expose', exposeId] });
      
      toast({
        title: "Success",
        description: "Theme updated successfully!"
      });
    } catch (error) {
      console.error('Error updating theme:', error);
      toast({
        title: "Error",
        description: "Failed to update theme.",
        variant: "destructive"
      });
    }
  };
  
  // Update copy
  const handleSaveCopy = async () => {
    if (!exposeId) return;
    
    try {
      const { error } = await supabase
        .from('exposes')
        .update({
          headline,
          body_copy: bodyCopy
        })
        .eq('id', exposeId);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['expose', exposeId] });
      
      toast({
        title: "Success",
        description: "Copy updated successfully!"
      });
    } catch (error) {
      console.error('Error updating copy:', error);
      toast({
        title: "Error",
        description: "Failed to update copy.",
        variant: "destructive"
      });
    }
  };
  
  // Generate hero image
  const handleGenerateHero = async () => {
    if (!exposeId) return;
    setIsGenerating(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('generate-ai-image', {
        body: {
          exposeId,
          products: selectedProducts.map(product => ({
            title: product.title,
            sku: product.sku,
            image: product.image
          })),
          theme: themeDescription,
          headline,
          bodyCopy
        }
      });
      if (error) throw error;
      
      // Start polling for image generation status
      const pollInterval = setInterval(async () => {
        const {
          data: exposeData
        } = await supabase.from('exposes').select('hero_image_generation_status, hero_image_desktop_url, hero_image_tablet_url, hero_image_mobile_url, image_variations').eq('id', exposeId).single();
        console.log('Polling expose data:', exposeData);
        
        if (exposeData?.hero_image_generation_status === 'completed') {
          clearInterval(pollInterval);
          setIsGenerating(false);
          setImageGenerated(true);
          
          // Ensure the first variation is selected
          if (exposeData.image_variations && Array.isArray(exposeData.image_variations) && exposeData.image_variations.length > 0) {
            // Update the selected variation to 0 (first variation)
            await supabase.from('exposes').update({
              selected_variation_index: 0
            }).eq('id', exposeId);
          }
          
          // Refresh data
          refetchExpose();
          
          // Expand the preview panel to show the generated image
          setIsPreviewExpanded(true);
          
          toast({
            title: "Success",
            description: "Hero images generated successfully!"
          });
        } else if (exposeData?.hero_image_generation_status === 'error') {
          clearInterval(pollInterval);
          setIsGenerating(false);
          toast({
            title: "Error",
            description: "Failed to generate hero images. Please try again.",
            variant: "destructive"
          });
        }
      }, 2000);
      
      return () => clearInterval(pollInterval);
    } catch (error) {
      console.error('Error generating hero:', error);
      setIsGenerating(false);
      toast({
        title: "Error",
        description: "Failed to generate hero images. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleVariationSelect = async (index: number) => {
    if (!exposeId) return;
    try {
      const selectedUrl = exposeData?.image_variations?.[index];
      if (!selectedUrl || typeof selectedUrl !== 'string') {
        throw new Error('Invalid image URL');
      }
      
      const {
        error
      } = await supabase.from('exposes').update({
        selected_variation_index: index,
        hero_image_url: selectedUrl,
        hero_image_desktop_url: selectedUrl,
        hero_image_tablet_url: selectedUrl,
        hero_image_mobile_url: selectedUrl
      }).eq('id', exposeId);
      
      if (error) throw error;
      
      // Refresh expose data
      refetchExpose();
      
      toast({
        title: "Success",
        description: "Selected variation has been updated"
      });
    } catch (error) {
      console.error('Error updating selected variation:', error);
      toast({
        title: "Error",
        description: "Failed to update selected variation",
        variant: "destructive"
      });
    }
  };
  
  // Panel state
  const togglePreviewExpansion = () => {
    setIsPreviewExpanded(!isPreviewExpanded);
  };
  
  const handlePanelStateChange = (state: 'minimized' | 'preview' | 'expanded' | number) => {
    if (typeof state === 'string') {
      setPanelState(state);
    }
  };
  
  // Add to library
  const handleAddToLibrary = () => {
    toast({
      title: "Info",
      description: "This functionality is not yet implemented"
    });
  };
  
  // Regenerate image
  const handleRegenerate = () => {
    handleGenerateHero();
  };
  
  // Get content margin based on panel state
  const getContentMarginStyle = () => {
    if (isPreviewExpanded) {
      return { marginRight: '320px' };
    }
    return { marginRight: '40px' };
  };
  
  // Determine which step content to render based on current step
  const renderMainContent = () => {
    if (currentStep === 'products') {
      return (
        <div className="mt-5">
          <h2 className="text-2xl font-semibold mb-5">Select Products</h2>
          <ProductPicker 
            searchResults={[]}
            selectedProducts={selectedProducts}
            onSelect={(product) => {
              // Check if product is not already selected
              if (!selectedProducts.some(p => p.id === product.id)) {
                handleProductSelect([...selectedProducts, product]);
              }
            }}
            isLoading={false}
            error={null}
            searchTerm=""
            onSearch={() => {}}
          />
        </div>
      );
    } else if (currentStep === 'theme-content') {
      return (
        <div className="mt-5">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-5">Choose a Theme</h2>
            <ThemeSelector 
              value={selectedTheme} 
              onChange={handleThemeSelect} 
            />
          </div>
          
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-5">Create Copy</h2>
            <div className="max-w-2xl">
              <div className="mb-5">
                <label className="block mb-2 font-medium">Headline</label>
                <Input 
                  value={headline} 
                  onChange={(e) => setHeadline(e.target.value)} 
                  placeholder="Enter headline..."
                  className="w-full"
                />
              </div>
              <div className="mb-5">
                <label className="block mb-2 font-medium">Body Copy</label>
                <Textarea 
                  value={bodyCopy} 
                  onChange={(e) => setBodyCopy(e.target.value)} 
                  placeholder="Enter body copy..."
                  rows={6}
                  className="w-full"
                />
              </div>
              <Button 
                onClick={handleSaveCopy}
                variant="default"
              >
                Save Copy
              </Button>
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-5">Generate Hero Image</h2>
            <div className="mb-5">
              <p className="text-gray-600 mb-3">
                Generate a hero image based on your selected products, theme, and copy.
              </p>
              <Button 
                onClick={handleGenerateHero}
                variant="default"
                disabled={isGenerating || selectedProducts.length === 0}
              >
                {isGenerating ? 'Generating...' : 'Generate Hero Image'}
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  const getPreviewImageUrl = () => {
    if (exposeData?.image_variations && 
        Array.isArray(exposeData.image_variations) && 
        exposeData.image_variations.length > 0 && 
        exposeData.selected_variation_index !== undefined) {
      
      const selectedVariation = exposeData.image_variations[exposeData.selected_variation_index];
      
      if (typeof selectedVariation === 'string') {
        return selectedVariation;
      }
    }
    
    if (exposeData?.hero_image_mobile_url) {
      return exposeData.hero_image_mobile_url;
    } else if (exposeData?.hero_image_url) {
      return exposeData.hero_image_url;
    }
    
    return '/placeholder.svg';
  };

  const getImageVariations = () => {
    if (exposeData?.image_variations && Array.isArray(exposeData.image_variations)) {
      return exposeData.image_variations.filter((url): url is string => typeof url === 'string');
    }
    return [];
  };

  const getSelectedVariationIndex = () => {
    return exposeData?.selected_variation_index !== undefined ? exposeData.selected_variation_index : 0;
  };

  return (
    <div className="max-w-[99.8rem] mx-auto">
      <ExposeHeader currentStep={currentStep} onStepClick={handleStepClick} />
      <div 
        className="bg-[--p-background] min-h-[calc(100vh-129px)]"
        style={getContentMarginStyle()}
      >
        <div className="p-5">
          {renderMainContent()}
        </div>
      </div>
      
      <PreviewPanel
        imageUrl={getPreviewImageUrl()}
        headline={headline}
        bodyCopy={bodyCopy}
        imageVariations={getImageVariations()}
        selectedVariationIndex={getSelectedVariationIndex()}
        onVariationSelect={handleVariationSelect}
        isExpanded={isPreviewExpanded}
        onToggleExpand={togglePreviewExpansion}
        onPanelStateChange={handlePanelStateChange}
        onAddToLibrary={handleAddToLibrary}
        onRegenerate={handleRegenerate}
        showActions={imageGenerated}
      />
    </div>
  );
};

export default Expose;
