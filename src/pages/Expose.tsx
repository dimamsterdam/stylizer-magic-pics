import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductPicker } from "@/components/ProductPicker";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Grid3X3 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { ThemeSelector } from "@/components/ThemeSelector";
import { THEMES } from "@/lib/themes";

interface Product {
  id: string;
  title: string;
  sku: string;
  image: string;
}

type Step = 'products' | 'configuration' | 'preview' | 'generation';

const Expose = () => {
  const [currentStep, setCurrentStep] = useState<Step>('products');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [selectedTheme, setSelectedTheme] = useState("");
  const [brandConstraints, setBrandConstraints] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [exposeId, setExposeId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check for authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to create exposes",
          variant: "destructive",
        });
        navigate('/auth');
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

  const handleThemeSelect = (themeId: string, styleGuide: string) => {
    setSelectedTheme(themeId);
    setBrandConstraints(styleGuide);
  };

  const handleContinue = async () => {
    if (selectedProducts.length === 0) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to create exposes",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('exposes')
        .insert({
          selected_product_ids: selectedProducts.map(p => p.id),
          status: 'draft',
          user_id: session.user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating expose:', error);
        throw error;
      }

      setExposeId(data.id);
      setCurrentStep('configuration');
    } catch (error) {
      console.error('Error creating expose:', error);
      toast({
        title: "Error",
        description: "Failed to create expose. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateHero = async () => {
    if (!exposeId || !selectedTheme) return;

    setIsGenerating(true);
    try {
      const selectedThemeData = THEMES.find(t => t.id === selectedTheme);
      const prompt = `Create a hero product image for ${selectedThemeData?.label}. ${
        brandConstraints ? `Style guidelines: ${brandConstraints}.` : ''
      } The image should feature ${selectedProducts.length} product${
        selectedProducts.length > 1 ? 's' : ''
      } in an engaging and professional composition.`;

      const response = await fetch('/api/generate-ai-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const { imageUrl } = await response.json();

      const { error: updateError } = await supabase
        .from('exposes')
        .update({
          hero_image_url: imageUrl,
          theme: selectedTheme,
          brand_constraints: brandConstraints
        })
        .eq('id', exposeId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Hero image generated successfully!",
      });
      setCurrentStep('generation');
    } catch (error) {
      console.error('Error generating hero:', error);
      toast({
        title: "Error",
        description: "Failed to generate hero image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'products':
        return (
          <Card className="border-0 shadow-sm">
            <CardHeader className="p-6 pb-2">
              <h2 className="text-lg font-semibold text-[#1A1F2C] mb-1">Select Products</h2>
              <p className="text-[#6D7175]">Choose up to three products to feature in your hero image</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
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
                    <h3 className="text-sm font-medium text-[#1A1F2C] mb-3">
                      Selected Products ({selectedProducts.length}/3)
                    </h3>
                    <div className="space-y-3">
                      {selectedProducts.map(product => (
                        <div
                          key={product.id}
                          className="flex items-center p-4 border rounded-lg border-[#E3E5E7] bg-white"
                        >
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                          <div className="ml-3 flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-[#1A1F2C] truncate">
                              {product.title}
                            </h4>
                            <p className="text-xs text-[#6D7175]">SKU: {product.sku}</p>
                          </div>
                          <Button
                            onClick={() => handleProductRemove(product.id)}
                            variant="ghost"
                            className="text-[#6D7175] hover:text-red-600 hover:bg-red-50"
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
                    className="bg-[#008060] hover:bg-[#006e52] text-white px-6"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'configuration':
        return (
          <Card className="border-0 shadow-sm">
            <CardHeader className="p-6 pb-2">
              <div className="flex items-center mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentStep('products')}
                  className="mr-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h2 className="text-lg font-semibold text-[#1A1F2C] mb-1">Select Theme</h2>
                  <p className="text-[#6D7175]">Choose a theme for your hero image</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <ThemeSelector
                  value={selectedTheme}
                  onChange={handleThemeSelect}
                />
                
                <div className="space-y-2">
                  <Label htmlFor="brand-constraints">Brand Style Guidelines</Label>
                  <Textarea
                    id="brand-constraints"
                    value={brandConstraints}
                    onChange={(e) => setBrandConstraints(e.target.value)}
                    className="h-24"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => setCurrentStep('preview')}
                    disabled={!selectedTheme}
                    className="bg-[#008060] hover:bg-[#006e52] text-white px-6"
                  >
                    Preview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'preview':
        const selectedThemeData = THEMES.find(t => t.id === selectedTheme);
        return (
          <Card className="border-0 shadow-sm">
            <CardHeader className="p-6 pb-2">
              <div className="flex items-center mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentStep('configuration')}
                  className="mr-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h2 className="text-lg font-semibold text-[#1A1F2C] mb-1">Preview Configuration</h2>
                  <p className="text-[#6D7175]">Review your settings before generating the hero image</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-[#1A1F2C] mb-2">Selected Products</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedProducts.map(product => (
                        <div key={product.id} className="relative">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full aspect-square object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
                            <p className="text-white text-sm font-medium px-2 text-center">
                              {product.title}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-[#1A1F2C]">Layout Preview</h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-[#E3E5E7]">
                      <div className="flex items-center justify-center">
                        <Grid3X3 className="h-32 w-32 text-[#6D7175]" />
                      </div>
                      <p className="text-sm text-[#6D7175] text-center mt-2">
                        Products will be arranged in a visually appealing composition
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-[#1A1F2C] mb-2">Generation Settings</h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-[#E3E5E7] space-y-2">
                      <div>
                        <span className="text-sm font-medium text-[#1A1F2C]">Theme: </span>
                        <span className="text-sm text-[#6D7175]">{selectedThemeData?.label}</span>
                      </div>
                      {brandConstraints && (
                        <div>
                          <span className="text-sm font-medium text-[#1A1F2C]">Style Guidelines: </span>
                          <span className="text-sm text-[#6D7175]">{brandConstraints}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleGenerateHero}
                    disabled={isGenerating}
                    className="bg-[#008060] hover:bg-[#006e52] text-white px-6"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Hero Image'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'generation':
        return (
          <Card className="border-0 shadow-sm">
            <CardHeader className="p-6 pb-2">
              <h2 className="text-lg font-semibold text-[#1A1F2C] mb-1">Generation Complete</h2>
              <p className="text-[#6D7175]">Your hero image has been generated successfully</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center text-[#6D7175]">
                Hero image generated successfully!
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F7]">
      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-[#1A1F2C] text-2xl font-medium">Create an Expose</h1>
          <p className="text-[#6D7175] mt-1">Generate AI-driven hero images with your products</p>
        </div>

        <div className="max-w-3xl">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default Expose;
