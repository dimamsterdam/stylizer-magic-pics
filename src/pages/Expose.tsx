
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductPicker } from "@/components/ProductPicker";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Product {
  id: string;
  title: string;
  sku: string;
  image: string;
}

type Step = 'products' | 'hero';

const Expose = () => {
  const [currentStep, setCurrentStep] = useState<Step>('products');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [occasion, setOccasion] = useState("");
  const [brandConstraints, setBrandConstraints] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [exposeId, setExposeId] = useState<string | null>(null);
  const { toast } = useToast();
  
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

  const handleContinue = async () => {
    if (selectedProducts.length === 0) return;

    try {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('exposes')
        .insert({
          selected_product_ids: selectedProducts.map(p => p.id),
          status: 'draft',
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setExposeId(data.id);
      setCurrentStep('hero');
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
    if (!exposeId || !occasion) return;

    setIsGenerating(true);
    try {
      const prompt = `Create a hero product image for ${occasion}. ${
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
          occasion,
          brand_constraints: brandConstraints
        })
        .eq('id', exposeId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Hero image generated successfully!",
      });
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

      case 'hero':
        return (
          <Card className="border-0 shadow-sm">
            <CardHeader className="p-6 pb-2">
              <h2 className="text-lg font-semibold text-[#1A1F2C] mb-1">Generate Hero Image</h2>
              <p className="text-[#6D7175]">Customize your hero image generation settings</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="occasion">Occasion or Theme</Label>
                    <Input
                      id="occasion"
                      placeholder="e.g., Valentine's Day, Summer Sale, New Collection"
                      value={occasion}
                      onChange={(e) => setOccasion(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="brand-constraints">Brand Style Guidelines (Optional)</Label>
                    <Textarea
                      id="brand-constraints"
                      placeholder="e.g., Minimalist aesthetic, bright and airy, dark and moody"
                      value={brandConstraints}
                      onChange={(e) => setBrandConstraints(e.target.value)}
                      className="h-24"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleGenerateHero}
                    disabled={!occasion || isGenerating}
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
