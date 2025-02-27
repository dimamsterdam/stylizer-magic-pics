import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ProductPicker } from "@/components/ProductPicker";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, WandSparkles, Save, RotateCw, MoreVertical } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { ExposeHeader } from "@/components/expose/ExposeHeader";
import ImageGrid from '@/components/ImageGrid';
import { ThemeGenerator } from "@/components/ThemeGenerator";
import { PreviewPanel } from "@/components/expose/PreviewPanel";

interface Product {
  id: string;
  title: string;
  sku: string;
  image: string;
}
type Step = 'products' | 'theme-content' | 'results';
type PanelState = 'minimized' | 'preview' | 'expanded' | number;

const themeExamples = ["Festive red theme with soft lighting and night club background", "Minimalist white studio setup with dramatic shadows", "Natural outdoor setting with morning sunlight and autumn colors", "Modern urban environment with neon lights and city backdrop", "Elegant marble surface with gold accents and soft diffused lighting"];

const PLACEHOLDER_IMAGE = '/placeholder.svg';

const Expose = () => {
  const [currentStep, setCurrentStep] = useState<Step>('products');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [themeDescription, setThemeDescription] = useState("");
  const [headline, setHeadline] = useState("");
  const [bodyCopy, setBodyCopy] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [exposeId, setExposeId] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<number>(2);
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [panelState, setPanelState] = useState<PanelState>('minimized');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to create exposes",
          variant: "destructive"
        });
        navigate('/auth', {
          state: {
            returnUrl: '/expose'
          }
        });
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholderIndex(prev => (prev + 1) % themeExamples.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const {
    data: exposeData,
    isLoading: isLoadingExpose
  } = useQuery({
    queryKey: ['expose', exposeId],
    queryFn: async () => {
      if (!exposeId) throw new Error('No expose ID');
      console.log('Fetching expose data for ID:', exposeId);
      const {
        data,
        error
      } = await supabase.from('exposes').select(`
          hero_image_url,
          hero_image_desktop_url,
          hero_image_tablet_url,
          hero_image_mobile_url,
          hero_image_generation_status,
          image_variations,
          selected_variation_index
        `).eq('id', exposeId).maybeSingle();
      console.log('Fetched expose data:', data);
      if (error) throw error;
      return data;
    },
    enabled: !!exposeId
  });

  const {
    data: searchResults = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['products', searchTerm],
    queryFn: async () => {
      if (searchTerm.length < 2) return [];
      const {
        data,
        error
      } = await supabase.from('products').select('id, title, sku, image_url').ilike('title', `%${searchTerm}%`).limit(10);
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
    if (selectedProducts.length < 3) {
      setSelectedProducts(prev => [...prev, product]);
    }
  };

  const handleProductRemove = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleContinue = async () => {
    if (currentStep === 'products' && selectedProducts.length === 0) return;
    if (currentStep === 'theme-content' && !themeDescription.trim()) return;
    
    if (currentStep === 'products') {
      try {
        const {
          data,
          error
        } = await supabase.from('exposes').insert({
          selected_product_ids: selectedProducts.map(p => p.id),
          status: 'draft',
          user_id: (await supabase.auth.getSession()).data.session!.user.id
        }).select().single();
        if (error) throw error;
        setExposeId(data.id);
        setCurrentStep('theme-content');
      } catch (error) {
        console.error('Error creating expose:', error);
        toast({
          title: "Error",
          description: "Failed to create expose. Please try again.",
          variant: "destructive"
        });
      }
    } else if (currentStep === 'theme-content') {
      try {
        if (!exposeId) throw new Error('No expose ID');
        const {
          error
        } = await supabase.from('exposes').update({
          theme_description: themeDescription,
          headline,
          body_copy: bodyCopy
        }).eq('id', exposeId);
        if (error) throw error;
        await handleGenerateHero();
      } catch (error) {
        console.error('Error updating expose:', error);
        toast({
          title: "Error",
          description: "Failed to save expose. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleHeadlineChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const cleanedValue = e.target.value.replace(/['"]/g, '');
    setHeadline(cleanedValue);
  };

  const generateContent = async () => {
    try {
      setIsGeneratingContent(true);
      toast({
        title: "Generating content",
        description: "Generating headline and body copy..."
      });

      const toneStyles: ToneStyle[] = ['formal', 'elegant', 'informal', 'playful', 'edgy'];
      const currentTone = toneStyles[selectedTone];
      
      // Generate headline
      const headlineResponse = await supabase.functions.invoke('generate-content', {
        body: {
          type: 'headline',
          products: selectedProducts.map(product => ({
            title: product.title,
            sku: product.sku
          })),
          theme: themeDescription,
          tone: currentTone,
          promptContext: `Create a compelling headline of maximum 12 words for an expose featuring ${selectedProducts.map(p => p.title).join(', ')}. The theme/mood is: ${themeDescription}. Use a ${currentTone} tone that is ${getToneDescription(currentTone)}`
        }
      });
      
      if (headlineResponse.error) throw headlineResponse.error;
      const { generatedText: headlineText } = headlineResponse.data;
      
      // Generate body copy
      const bodyResponse = await supabase.functions.invoke('generate-content', {
        body: {
          type: 'body',
          products: selectedProducts.map(product => ({
            title: product.title,
            sku: product.sku
          })),
          theme: themeDescription,
          tone: currentTone,
          promptContext: `Create a concise body copy of maximum 40 words for an expose featuring ${selectedProducts.map(p => p.title).join(', ')}. The theme/mood is: ${themeDescription}. Use a ${currentTone} tone that is ${getToneDescription(currentTone)}`
        }
      });
      
      if (bodyResponse.error) throw bodyResponse.error;
      const { generatedText: bodyText } = bodyResponse.data;
      
      // Process and set the headline - ensure all quotes are removed
      const cleanedHeadlineText = headlineText.replace(/['"]/g, '');
      const headlineWords = cleanedHeadlineText.split(' ');
      if (headlineWords.length > 12) {
        setHeadline(headlineWords.slice(0, 12).join(' '));
      } else {
        setHeadline(cleanedHeadlineText);
      }
      
      // Process and set the body copy
      const bodyWords = bodyText.split(' ');
      if (bodyWords.length > 40) {
        setBodyCopy(bodyWords.slice(0, 40).join(' '));
      } else {
        setBodyCopy(bodyText);
      }
      
      toast({
        title: "Success",
        description: "Content generated successfully!"
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const getToneDescription = (tone: ToneStyle) => {
    const descriptions: Record<ToneStyle, string> = {
      formal: "polished, professional, and authoritative",
      elegant: "graceful, refined, and slightly poetic",
      informal: "friendly, casual, and conversational",
      playful: "fun, energetic, and a bit cheeky",
      edgy: "bold, daring, and provocative"
    };
    return descriptions[tone];
  };

  const handleBodyCopyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const words = e.target.value.split(' ');
    if (words.length > 40) {
      setBodyCopy(words.slice(0, 40).join(' '));
      toast({
        title: "Word limit reached",
        description: "Body copy is limited to 40 words"
      });
    } else {
      setBodyCopy(e.target.value);
    }
  };

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
      const pollInterval = setInterval(async () => {
        const {
          data: exposeData
        } = await supabase.from('exposes').select('hero_image_generation_status, hero_image_desktop_url, hero_image_tablet_url, hero_image_mobile_url').eq('id', exposeId).single();
        console.log('Polling expose data:', exposeData);
        if (exposeData?.hero_image_generation_status === 'completed') {
          clearInterval(pollInterval);
          setIsGenerating(false);
          toast({
            title: "Success",
            description: "Hero images generated successfully!"
          });
          setCurrentStep('results');
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

  const handleThemeSelect = (theme: string) => {
    setThemeDescription(theme);
  };

  const handleStepClick = (step: Step) => {
    setCurrentStep(step);
  };

  const handleAddToLibrary = async () => {
    if (!exposeId) return;
    try {
      toast({
        title: "Success",
        description: "Expose added to library successfully!"
      });
      navigate('/library');
    } catch (error) {
      console.error('Error navigating to library:', error);
      toast({
        title: "Error",
        description: "Failed to navigate to library. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRegenerate = async () => {
    setCurrentStep('theme-content');
    toast({
      title: "Ready to regenerate",
      description: "You can now modify your settings and generate a new image."
    });
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

  const togglePreviewExpansion = () => {
    setIsPreviewExpanded(!isPreviewExpanded);
  };

  const handlePanelStateChange = (state: PanelState) => {
    setPanelState(state);
    console.log("Panel state changed:", state);
  };

  const getContentPaddingStyle = () => {
    if (typeof panelState === 'number') {
      return { paddingBottom: `${panelState}vh` };
    }
    
    switch (panelState) {
      case 'expanded':
        return { paddingBottom: '70vh' };
      case 'preview':
        return { paddingBottom: '25vh' };
      case 'minimized':
      default:
        return { paddingBottom: '32px' };
    }
  };

  const renderProductsStep = () => {
    return (
      <Card className="bg-[--p-surface] shadow-[--p-shadow-card] border-[--p-border-subdued]">
        <CardContent className="p-6 space-y-6">
          <div className="mt-4">
            <h2 className="text-display-sm text-[--p-text] mb-1">Select Products</h2>
            <p className="text-body text-[--p-text-subdued]">
              Choose up to three products to feature in your hero image
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
                Selected Products ({selectedProducts.length}/3)
              </h3>
              <div className="space-y-3">
                {selectedProducts.map(product => (
                  <div 
                    key={product.id} 
                    className="flex items-center p-4 border rounded-lg border-[--p-border] bg-[--p-surface]"
                  >
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="w-12 h-12 object-cover rounded"
                      onError={e => { e.currentTarget.src = '/placeholder.svg'; }}
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
              className="bg-[--p-action-primary] text-white hover:bg-[--p-action-primary-hovered]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : 'Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderThemeContentStep = () => {
    return (
      <Card className="bg-[--p-surface] shadow-[--p-shadow-card] border-[--p-border-subdued]">
        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="text-display-sm text-[--p-text] mb-1">Theme & Content</h2>
            <p className="text-body text-[--p-text-subdued]">Describe your theme and manage content</p>
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="theme-description" className="text-heading text-[--p-text]">Creative Brief</Label>
              <Textarea 
                id="theme-description"
                value={themeDescription}
                onChange={e => setThemeDescription(e.target.value)}
                placeholder={themeExamples[currentPlaceholderIndex]}
                className="min-h-[8rem] border-[--p-border] focus:border-[--p-focused] bg-[--p-surface] text-body"
              />
            </div>

            <ThemeGenerator 
              onThemeSelect={handleThemeSelect} 
              selectedProducts={selectedProducts} 
              onContentRegenerate={generateContent}
            />

            <div className="border-t border-[--p-border-subdued] pt-4 mt-4">
              <h3 className="text-heading text-[--p-text] mb-3">Content</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="headline" className="text-heading text-[--p-text]">Headline</Label>
                  </div>
                  <Textarea 
                    id="headline" 
                    value={headline} 
                    onChange={handleHeadlineChange} 
                    placeholder="Enter a compelling headline" 
                    className="text-lg min-h-[40px] resize-none overflow-hidden" 
                    rows={1} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body-copy" className="text-heading text-[--p-text]">Body Copy (40 words max)</Label>
                  <Textarea 
                    id="body-copy" 
                    value={bodyCopy} 
                    onChange={handleBodyCopyChange} 
                    placeholder="Enter the main content of your expose..." 
                    className="h-48 border-[--p-border] focus:border-[--p-focused] bg-[--p-surface]"
                  />
                  <p className="text-sm text-[--p-text-subdued]">
                    {bodyCopy.split(' ').length}/40 words
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <Button 
                    onClick={generateContent}
                    variant="outline"
                    disabled={isGeneratingContent || !themeDescription.trim()}
                  >
                    {isGeneratingContent ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <WandSparkles className="mr-2 h-4 w-4" />
                        Regenerate Content
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleContinue}
              disabled={isGenerating || !themeDescription.trim() || !headline.trim() || !bodyCopy.trim()}
              className="bg-[--p-action-primary] text-white hover:bg-[--p-action-primary-hovered]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : 'Generate Hero Image'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderResultsStep = () => {
    return (
      <Card className="bg-[--p-surface] shadow-[--p-shadow-card] border-[--p-border-subdued]">
        <CardContent className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-display-sm text-[--p-text] mb-1">Results</h2>
              <p className="text-body text-[--p-text-subdued]">Your expose has been generated successfully</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4 text-[#6D7175]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuItem onClick={handleAddToLibrary}>
                  <Save className="mr-2 h-4 w-4" />
                  <span>Add to Library</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleRegenerate}>
                  <RotateCw className="mr-2 h-4 w-4" />
                  <span>Regenerate</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-6">
            {isLoadingExpose ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#008060]" />
              </div>
            ) : exposeData ? (
              <ImageGrid 
                variations={exposeData.image_variations as string[] || [exposeData.hero_image_url!]} 
                selectedIndex={exposeData.selected_variation_index || 0} 
                onSelect={handleVariationSelect} 
                headline={headline} 
                bodyCopy={bodyCopy} 
              />
            ) : (
              <div className="text-center py-12 border rounded-lg bg-gray-50">
                <p className="text-[#6D7175]">No generated image found. Please try generating again.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderMainContent = () => {
    switch (currentStep) {
      case 'products': return renderProductsStep();
      case 'theme-content': return renderThemeContentStep();
      case 'results': return renderResultsStep();
      default: return null;
    }
  };

  const getPreviewImageUrl = () => {
    if (exposeData?.hero_image_url) {
      if (exposeData.image_variations && 
          Array.isArray(exposeData.image_variations) && 
          exposeData.selected_variation_index !== undefined) {
        
        const selectedVariation = exposeData.image_variations[exposeData.selected_variation_index];
        
        if (typeof selectedVariation === 'string') {
          return selectedVariation;
        }
        
        return exposeData.hero_image_url;
      }
      return exposeData.hero_image_url;
    }
    
    return PLACEHOLDER_IMAGE;
  };

  return (
    <div className="max-w-[99.8rem] mx-auto">
      <ExposeHeader currentStep={currentStep} onStepClick={handleStepClick} />
      <div 
        className="bg-[--p-background] min-h-[calc(100vh-129px)]"
        style={{ 
          ...getContentPaddingStyle(),
          transition: typeof panelState === 'number' ? 'none' : 'padding-bottom 0.3s ease-out'
        }}
      >
        <div className="p-5">
          {renderMainContent()}
        </div>
        
        <PreviewPanel
          imageUrl={getPreviewImageUrl()}
          headline={headline}
          bodyCopy={bodyCopy}
          isExpanded={isPreviewExpanded}
          onToggleExpand={togglePreviewExpansion}
          onPanelStateChange={handlePanelStateChange}
        />
      </div>
    </div>
  );
};

export default Expose;
