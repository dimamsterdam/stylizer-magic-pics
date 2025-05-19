import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductPicker } from "@/components/ProductPicker";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, WandSparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { ExposeHeader } from "@/components/expose/ExposeHeader";
import ImageGrid from '@/components/ImageGrid';
import { ThemeGenerator } from "@/components/ThemeGenerator";
import { PreviewPanel } from "@/components/expose/PreviewPanel";
import { PromptBuilder } from "@/components/expose/PromptBuilder";
import { ModelAttributes } from "@/types/modelTypes";
import { SlidePrompt, SlidePromptEditor } from "@/components/expose/SlidePromptEditor";
import { SlideGallery } from "@/components/expose/SlideGallery";
import { SpotlightTypeSelector } from "@/components/expose/SpotlightTypeSelector";

interface Product {
  id: string;
  title: string;
  sku: string;
  image: string;
}

interface Slide extends SlidePrompt {
  isVideo?: boolean;
}

type Step = 'products' | 'theme-content';
type PanelState = 'minimized' | 'preview' | 'expanded' | number;

const themeExamples = [
  "Festive red theme with soft lighting and night club background", 
  "Minimalist white studio setup with dramatic shadows", 
  "Natural outdoor setting with morning sunlight and autumn colors", 
  "Modern urban environment with neon lights and city backdrop", 
  "Elegant marble surface with gold accents and soft diffused lighting"
];

const PLACEHOLDER_IMAGE = '/placeholder.svg';

const Expose = () => {
  const [currentStep, setCurrentStep] = useState<Step>('products');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [headline, setHeadline] = useState("");
  const [bodyCopy, setBodyCopy] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [exposeId, setExposeId] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<number>(2);
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [panelState, setPanelState] = useState<PanelState>('minimized');
  const [imageGenerated, setImageGenerated] = useState(false);
  const [generationError, setGenerationError] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState('');
  const [isMultiSlide, setIsMultiSlide] = useState(false);
  const [slidePrompts, setSlidePrompts] = useState<SlidePrompt[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  const {
    toast
  } = useToast();
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
    isLoading: isLoadingExpose,
    refetch: refetchExpose
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
          selected_variation_index,
          is_multi_slide,
          slides,
          slide_order,
          video_slides
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
    if (currentStep === 'theme-content' && !finalPrompt.trim()) return;
    
    if (currentStep === 'products') {
      try {
        const {
          data,
          error
        } = await supabase.from('exposes').insert({
          selected_product_ids: selectedProducts.map(p => p.id),
          status: 'draft',
          is_multi_slide: isMultiSlide,
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
        
        if (isMultiSlide) {
          // Validate slide prompts for multi-slide mode
          const validSlidePrompts = slidePrompts.filter(slide => slide.text.trim());
          if (validSlidePrompts.length === 0) {
            toast({
              title: "Error",
              description: "Please add at least one valid slide prompt.",
              variant: "destructive"
            });
            return;
          }
          
          const {
            error
          } = await supabase.from('exposes').update({
            theme_description: finalPrompt,
            headline,
            body_copy: bodyCopy,
          }).eq('id', exposeId);
          if (error) throw error;
          
          await handleGenerateHero(validSlidePrompts);
        } else {
          // Single slide mode
          const {
            error
          } = await supabase.from('exposes').update({
            theme_description: finalPrompt,
            headline,
            body_copy: bodyCopy
          }).eq('id', exposeId);
          if (error) throw error;
          
          await handleGenerateHero();
        }
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
      const toneStyles = ['formal', 'elegant', 'informal', 'playful', 'edgy'];
      const currentTone = toneStyles[selectedTone];

      // Generate headline
      const headlineResponse = await supabase.functions.invoke('generate-content', {
        body: {
          type: 'headline',
          products: selectedProducts.map(product => ({
            title: product.title,
            sku: product.sku
          })),
          theme: finalPrompt,
          tone: currentTone,
          promptContext: `Create a compelling headline of maximum 12 words for an expose featuring ${selectedProducts.map(p => p.title).join(', ')}. The theme/mood is: ${finalPrompt}. Use a ${currentTone} tone that is ${getToneDescription(currentTone)}`
        }
      });
      if (headlineResponse.error) throw headlineResponse.error;
      const {
        generatedText: headlineText
      } = headlineResponse.data;

      // Generate body copy
      const bodyResponse = await supabase.functions.invoke('generate-content', {
        body: {
          type: 'body',
          products: selectedProducts.map(product => ({
            title: product.title,
            sku: product.sku
          })),
          theme: finalPrompt,
          tone: currentTone,
          promptContext: `Create a concise body copy of maximum 40 words for an expose featuring ${selectedProducts.map(p => p.title).join(', ')}. The theme/mood is: ${finalPrompt}. Use a ${currentTone} tone that is ${getToneDescription(currentTone)}`
        }
      });
      if (bodyResponse.error) throw bodyResponse.error;
      const {
        generatedText: bodyText
      } = bodyResponse.data;

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
      
      // If we're in multi-slide mode, also generate slide prompts
      if (isMultiSlide) {
        await generateSlideStory();
      }
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
  
  const generateSlideStory = async () => {
    if (!selectedProducts.length) return;
    
    try {
      toast({
        title: "Generating slide story",
        description: "Creating prompts for your product story..."
      });
      
      const response = await supabase.functions.invoke('generate-story-content', {
        body: {
          productInfo: {
            name: selectedProducts[0].title,
            description: "Product from the catalog"
          },
          theme: finalPrompt,
          slideCount: 3
        }
      });
      
      if (response.error) throw new Error(response.error);
      
      const { slides } = response.data;
      
      if (!Array.isArray(slides) || slides.length === 0) {
        throw new Error('Failed to generate slide prompts');
      }
      
      const formattedSlides: SlidePrompt[] = slides.map((slide: any, index: number) => ({
        id: `story-slide-${Date.now()}-${index}`,
        text: slide.prompt || `Slide ${index + 1} featuring the product`,
        status: 'completed' as const
      }));
      
      setSlidePrompts(formattedSlides);
      
      toast({
        title: "Success",
        description: "Slide story generated successfully!"
      });
    } catch (error) {
      console.error('Error generating slide story:', error);
      toast({
        title: "Error",
        description: "Failed to generate slide story. You can still create slides manually."
      });
      
      // Create default empty slide prompts if generation fails
      if (slidePrompts.length === 0) {
        setSlidePrompts([
          {
            id: `slide-${Date.now()}-1`,
            text: "",
            status: 'pending' as const
          }
        ]);
      }
    }
  };
  
  const getToneDescription = (tone: string) => {
    const descriptions: Record<string, string> = {
      formal: "polished, professional, and authoritative",
      elegant: "graceful, refined, and slightly poetic",
      informal: "friendly, casual, and conversational",
      playful: "fun, energetic, and a bit cheeky",
      edgy: "bold, daring, and provocative"
    };
    return descriptions[tone] || '';
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
  
  const handleGenerateHero = async (customSlides?: SlidePrompt[]) => {
    if (!exposeId) return;
    setIsGenerating(true);
    setGenerationError(false);
    
    try {
      console.log('Starting image generation for exposeId:', exposeId);
      
      const requestBody = {
        exposeId,
        products: selectedProducts.map(product => ({
          title: product.title,
          sku: product.sku,
          image: product.image
        })),
        theme: finalPrompt,
        headline,
        bodyCopy,
        isMultiSlide,
        slides: customSlides || slidePrompts
      };
      
      console.log('Sending request with body:', requestBody);
      
      const {
        data,
        error
      } = await supabase.functions.invoke('generate-fal-images', {
        body: requestBody
      });
      
      if (error) {
        console.error('Function invocation error:', error);
        throw error;
      }
      
      console.log('Image generation response:', data);

      // Start polling for image generation status
      const pollInterval = setInterval(async () => {
        try {
          console.log('Polling for image generation status...');
          const {
            data: exposeData,
            error: pollError
          } = await supabase.from('exposes').select('hero_image_generation_status, hero_image_desktop_url, hero_image_tablet_url, hero_image_mobile_url, error_message, slides, is_multi_slide').eq('id', exposeId).single();
          
          if (pollError) {
            console.error('Error polling for expose data:', pollError);
            throw pollError;
          }
          
          console.log('Polling expose data:', exposeData);
          if (exposeData?.hero_image_generation_status === 'completed') {
            clearInterval(pollInterval);
            setIsGenerating(false);
            setImageGenerated(true);
            setGenerationError(false);
            refetchExpose();

            // Update local slide prompts if multi-slide and we have generated slides
            if (isMultiSlide && exposeData?.slides?.length > 0) {
              setSlidePrompts(exposeData.slides);
            }

            // Expand the preview panel to show the generated image
            setIsPreviewExpanded(true);
            toast({
              title: "Success",
              description: `Hero ${isMultiSlide ? 'slides' : 'image'} generated successfully!`
            });
          } else if (exposeData?.hero_image_generation_status === 'error') {
            clearInterval(pollInterval);
            setIsGenerating(false);
            setGenerationError(true);
            toast({
              title: "Error",
              description: exposeData?.error_message || "Failed to generate hero images. Please try again.",
              variant: "destructive"
            });
          }
        } catch (pollError) {
          console.error('Error in polling:', pollError);
          clearInterval(pollInterval);
          setIsGenerating(false);
          setGenerationError(true);
          toast({
            title: "Error",
            description: "Failed to check image generation status. Please try again.",
            variant: "destructive"
          });
        }
      }, 3000); // Poll every 3 seconds

      // Cleanup poll interval on component unmount
      return () => clearInterval(pollInterval);
    } catch (error) {
      console.error('Error generating hero:', error);
      setIsGenerating(false);
      setGenerationError(true);
      toast({
        title: "Error",
        description: "Failed to generate hero images. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleSlidePromptsUpdate = (updatedSlides: SlidePrompt[]) => {
    setSlidePrompts(updatedSlides);
  };
  
  const handlePromptChange = (prompt: string) => {
    setFinalPrompt(prompt);
  };
  
  const handlePromptFinalize = (prompt: string) => {
    setFinalPrompt(prompt);
    generateContent();
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
    setImageGenerated(false);
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
  
  const handleSelectVariation = (slideId: string, variationIndex: number) => {
    console.log(`Selected variation ${variationIndex} for slide ${slideId}`);
    // In a real implementation, this would update the database
    toast({
      title: "Variation selected",
      description: `Selected variation ${variationIndex + 1} for this slide`
    });
  };
  
  const handleToggleVideo = (slideId: string) => {
    console.log(`Toggled video for slide ${slideId}`);
    // In a real implementation, this would update the database
    toast({
      title: "Video toggled",
      description: "This feature is coming soon"
    });
  };
  
  const togglePreviewExpansion = () => {
    setIsPreviewExpanded(!isPreviewExpanded);
  };
  
  const handlePanelStateChange = (state: PanelState) => {
    setPanelState(state);
    console.log("Panel state changed:", state);
  };
  
  const getContentMarginStyle = () => {
    return {
      marginRight: isPreviewExpanded ? '320px' : '40px',
      transition: 'margin-right 0.3s ease-in-out'
    };
  };
  
  const renderProductsStep = () => {
    return (
      <Card className="bg-[--p-surface] shadow-sm border border-[#E3E5E7] rounded-md">
        <CardContent className="p-6 space-y-6">
          <div className="mt-4">
            <h2 className="text-display-sm text-[--p-text] mb-1">Select Products</h2>
            <p className="text-body text-[--p-text-subdued]">
              Choose up to three products to feature in your spotlight
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
          
          {selectedProducts.length > 0 && (
            <div className="mt-4">
              <SpotlightTypeSelector 
                isMultiSlide={isMultiSlide} 
                onChange={setIsMultiSlide}
              />
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleContinue} 
              disabled={selectedProducts.length === 0} 
              variant="primary"
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
      <Card className="bg-[--p-surface] shadow-sm border border-[#E3E5E7] rounded-md">
        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="text-display-sm text-[--p-text] mb-1">Design brief</h2>
            <p className="text-body text-[--p-text-subdued]">Be the art director of your product spotlight</p>
          </div>

          <div className="space-y-5">
            <PromptBuilder 
              value={finalPrompt} 
              onChange={handlePromptChange} 
              onFinalize={handlePromptFinalize} 
            />
            
            {isMultiSlide && finalPrompt && (
              <div className="space-y-6 mt-6 pt-6 border-t border-[#E3E5E7]">
                <h3 className="text-heading text-[--p-text]">Slide Story</h3>
                <div>
                  {slidePrompts.length === 0 ? (
                    <Button 
                      onClick={generateSlideStory} 
                      disabled={isGeneratingContent}
                      variant="outline"
                    >
                      {isGeneratingContent ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Story...
                        </>
                      ) : (
                        <>
                          <WandSparkles className="mr-2 h-4 w-4" />
                          Generate Slide Story
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <SlidePromptEditor 
                        slides={slidePrompts}
                        onSlideUpdate={handleSlidePromptsUpdate}
                        isGenerating={isGenerating || isGeneratingContent}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-4 mt-6">
              <div>
                <Label htmlFor="headline" className="text-[--p-text] font-medium">Headline</Label>
                <Textarea 
                  id="headline" 
                  value={headline} 
                  onChange={handleHeadlineChange} 
                  className="min-h-[80px] mt-2 border-[#E3E5E7]" 
                  placeholder="Your headline will appear here after generating content..." 
                />
              </div>
              
              <div>
                <Label htmlFor="bodyCopy" className="text-[--p-text] font-medium">Body Copy</Label>
                <Textarea 
                  id="bodyCopy" 
                  value={bodyCopy} 
                  onChange={handleBodyCopyChange} 
                  className="min-h-[100px] mt-2 border-[#E3E5E7]" 
                  placeholder="Your body copy will appear here after generating content..." 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              type="button" 
              onClick={() => handleContinue()} 
              disabled={isGenerating || !finalPrompt.trim() || 
                (isMultiSlide && slidePrompts.filter(slide => slide.text.trim()).length === 0)} 
              variant="primary"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : 'Generate Hero'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const renderMainContent = () => {
    switch (currentStep) {
      case 'products':
        return renderProductsStep();
      case 'theme-content':
        return renderThemeContentStep();
      default:
        return null;
    }
  };
  
  const getPreviewContent = () => {
    if (!exposeData) return null;
    
    if (exposeData.is_multi_slide && Array.isArray(exposeData.slides) && exposeData.slides.length > 0) {
      // Multi-slide preview - transform database slides to proper type
      const typedSlides = (exposeData.slides as any[]).map((slide: any): (SlidePrompt & { imageUrl: string }) => {
        return {
          id: slide.id || `slide-${Date.now()}`,
          text: slide.text || "",
          imageUrl: slide.imageUrl || slide.variations?.[slide.selectedVariation || 0] || PLACEHOLDER_IMAGE,
          variations: slide.variations || [],
          selectedVariation: slide.selectedVariation || 0,
          isVideo: slide.isVideo || false,
          status: (slide.status as 'pending' | 'generating' | 'completed' | 'error') || 'completed'
        };
      });
      
      return (
        <SlideGallery
          slides={typedSlides}
          headline={headline}
          bodyCopy={bodyCopy}
          onSelectVariation={handleSelectVariation}
          onToggleVideo={handleToggleVideo}
          isLoading={isGenerating}
        />
      );
    } else {
      // Single image preview
      const imageUrl = exposeData.hero_image_mobile_url || 
                      exposeData.hero_image_url || 
                      (exposeData.image_variations && 
                       Array.isArray(exposeData.image_variations) && 
                       exposeData.selected_variation_index !== undefined ? 
                        exposeData.image_variations[exposeData.selected_variation_index] as string : 
                        PLACEHOLDER_IMAGE);
      
      return (
        <div className="relative">
          <img 
            src={imageUrl} 
            alt="Generated hero"
            className="w-full h-full object-cover rounded-md"
            onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
          />
        </div>
      );
    }
  };
  
  return (
    <div className="max-w-[99.8rem] mx-auto">
      <ExposeHeader currentStep={currentStep} onStepClick={handleStepClick} />
      <div className="bg-[--p-background] min-h-[calc(100vh-129px)]" style={getContentMarginStyle()}>
        <div className="p-5">
          {renderMainContent()}
        </div>
      </div>
      
      <PreviewPanel 
        previewContent={getPreviewContent()}
        headline={headline}
        bodyCopy={bodyCopy}
        isExpanded={isPreviewExpanded}
        isLoading={isGenerating}
        hasError={generationError}
        onToggleExpand={togglePreviewExpansion}
        onPanelStateChange={handlePanelStateChange}
        onAddToLibrary={handleAddToLibrary}
        onRegenerate={handleRegenerate}
        showActions={imageGenerated}
        isMultiSlide={exposeData?.is_multi_slide}
      />
    </div>
  );
};

export default Expose;
