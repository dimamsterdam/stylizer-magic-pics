import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductPicker } from "@/components/ProductPicker";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Plus, Equal, WandSparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "@/components/Breadcrumbs";
import StepProgress from "@/components/StepProgress";

interface Product {
  id: string;
  title: string;
  sku: string;
  image: string;
}

type Step = 'products' | 'theme' | 'content' | 'review' | 'generation';

const Expose = () => {
  const [currentStep, setCurrentStep] = useState<Step>('products');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [themeDescription, setThemeDescription] = useState("");
  const [headline, setHeadline] = useState("");
  const [bodyCopy, setBodyCopy] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [exposeId, setExposeId] = useState<string | null>(null);
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
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to create exposes",
          variant: "destructive"
        });
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate, toast]);

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
    if (currentStep === 'theme' && !themeDescription.trim()) return;
    if (currentStep === 'content' && (!headline.trim() || !bodyCopy.trim())) return;
    if (currentStep === 'products') {
      try {
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
          navigate('/auth');
          return;
        }
        const {
          data,
          error
        } = await supabase.from('exposes').insert({
          selected_product_ids: selectedProducts.map(p => p.id),
          status: 'draft',
          user_id: session.user.id
        }).select().single();
        if (error) throw error;
        setExposeId(data.id);
        setCurrentStep('theme');
      } catch (error) {
        console.error('Error creating expose:', error);
        toast({
          title: "Error",
          description: "Failed to create expose. Please try again.",
          variant: "destructive"
        });
      }
    } else if (currentStep === 'theme') {
      try {
        if (!exposeId) throw new Error('No expose ID');
        const {
          error
        } = await supabase.from('exposes').update({
          theme_description: themeDescription
        }).eq('id', exposeId);
        if (error) throw error;
        setCurrentStep('content');
      } catch (error) {
        console.error('Error updating theme:', error);
        toast({
          title: "Error",
          description: "Failed to save theme. Please try again.",
          variant: "destructive"
        });
      }
    } else if (currentStep === 'content') {
      try {
        if (!exposeId) throw new Error('No expose ID');
        const {
          error
        } = await supabase.from('exposes').update({
          headline,
          body_copy: bodyCopy
        }).eq('id', exposeId);
        if (error) throw error;
        setCurrentStep('review');
      } catch (error) {
        console.error('Error updating content:', error);
        toast({
          title: "Error",
          description: "Failed to save content. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const generateContent = async (type: 'headline' | 'body') => {
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('generate-content', {
        body: {
          type,
          products: selectedProducts,
          theme: themeDescription
        }
      });
      if (error) throw error;
      const {
        generatedText
      } = data;
      if (type === 'headline') {
        setHeadline(generatedText);
      } else {
        setBodyCopy(generatedText);
      }
      toast({
        title: "Success",
        description: `Generated ${type} successfully!`
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: `Failed to generate ${type}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const handleGenerateHero = async () => {
    if (!exposeId) return;
    setIsGenerating(true);
    try {
      const prompt = `Create a hero product image. Theme description: ${themeDescription}. The image should feature ${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''} in an engaging and professional composition.`;
      const response = await fetch('/api/generate-ai-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt
        })
      });
      if (!response.ok) {
        throw new Error('Failed to generate image');
      }
      const {
        imageUrl
      } = await response.json();
      const {
        error: updateError
      } = await supabase.from('exposes').update({
        hero_image_url: imageUrl
      }).eq('id', exposeId);
      if (updateError) throw updateError;
      toast({
        title: "Success",
        description: "Hero image generated successfully!"
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
            </CardHeader>
            <StepProgress currentStep={currentStep} />
            <div className="px-6 pt-4">
              <h2 className="text-lg font-semibold text-[#1A1F2C] mb-1">Select Products</h2>
              <p className="text-[#6D7175]">Choose up to three products to feature in your hero image</p>
            </div>
            <CardContent className="p-6">
              <div className="space-y-6">
                <ProductPicker onSelect={handleProductSelect} selectedProducts={selectedProducts} searchResults={searchResults} isLoading={isLoading} error={error ? 'Error loading products' : null} searchTerm={searchTerm} onSearch={handleSearchChange} />

                {selectedProducts.length > 0 && <div className="mt-8">
                    <h3 className="text-sm font-medium text-[#1A1F2C] mb-3">
                      Selected Products ({selectedProducts.length}/3)
                    </h3>
                    <div className="space-y-3">
                      {selectedProducts.map(product => <div key={product.id} className="flex items-center p-4 border rounded-lg border-[#E3E5E7] bg-white">
                          <img src={product.image} alt={product.title} className="w-12 h-12 object-cover rounded" onError={e => {
                      e.currentTarget.src = '/placeholder.svg';
                    }} />
                          <div className="ml-3 flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-[#1A1F2C] truncate">
                              {product.title}
                            </h4>
                            <p className="text-xs text-[#6D7175]">SKU: {product.sku}</p>
                          </div>
                          <Button onClick={() => handleProductRemove(product.id)} variant="ghost" className="text-[#6D7175] hover:text-red-600 hover:bg-red-50">
                            Remove
                          </Button>
                        </div>)}
                    </div>
                  </div>}

                <div className="flex justify-end pt-4">
                  <Button onClick={handleContinue} disabled={selectedProducts.length === 0} className="bg-[#008060] hover:bg-[#006e52] text-white px-6">
                    Continue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'theme':
        return <Card className="border-0 shadow-sm">
            <CardHeader className="p-6 pb-2">
              <div className="flex items-center mb-4">
                
                <div>
                  
                  <p className="text-[#6D7175]">Tell us how you want your products to be presented</p>
                </div>
              </div>
            </CardHeader>
            <StepProgress currentStep={currentStep} />
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="theme-description">Creative Brief</Label>
                  <Textarea id="theme-description" value={themeDescription} onChange={e => setThemeDescription(e.target.value)} placeholder="Describe your desired theme (e.g., Minimalist product photography with soft lighting and neutral background)" className="h-32" />
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleContinue} disabled={!themeDescription.trim()} className="bg-[#008060] hover:bg-[#006e52] text-white px-6">
                    Continue to Content
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>;

      case 'content':
        return <Card className="border-0 shadow-sm">
            <CardHeader className="p-6 pb-2">
              <div className="flex items-center mb-4">
                <Button variant="ghost" size="icon" onClick={() => setCurrentStep('theme')} className="mr-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h2 className="text-lg font-semibold text-[#1A1F2C] mb-1">Add Content</h2>
                  <p className="text-[#6D7175]">Enter the text content for your expose</p>
                </div>
              </div>
            </CardHeader>
            <StepProgress currentStep={currentStep} />
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="headline">Headline</Label>
                    <Button variant="ghost" size="sm" onClick={() => generateContent('headline')} className="text-[#008060] hover:text-[#006e52]">
                      <WandSparkles className="h-4 w-4 mr-1" />
                      Generate
                    </Button>
                  </div>
                  <Input id="headline" value={headline} onChange={e => setHeadline(e.target.value)} placeholder="Enter a compelling headline..." className="text-lg" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="body-copy">Body Copy</Label>
                    <Button variant="ghost" size="sm" onClick={() => generateContent('body')} className="text-[#008060] hover:text-[#006e52]">
                      <WandSparkles className="h-4 w-4 mr-1" />
                      Generate
                    </Button>
                  </div>
                  <Textarea id="body-copy" value={bodyCopy} onChange={e => setBodyCopy(e.target.value)} placeholder="Enter the main content of your expose..." className="h-48" />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleContinue} disabled={!headline.trim() || !bodyCopy.trim()} className="bg-[#008060] hover:bg-[#006e52] text-white px-6">
                    Continue to Review
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>;

      case 'review':
        return <Card className="border-0 shadow-sm">
            <CardHeader className="p-6 pb-2">
              <div className="flex items-center mb-4">
                <Button variant="ghost" size="icon" onClick={() => setCurrentStep('content')} className="mr-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h2 className="text-lg font-semibold text-[#1A1F2C] mb-1">Review Your Expose</h2>
                  <p className="text-[#6D7175]">Review all details before generating</p>
                </div>
              </div>
            </CardHeader>
            <StepProgress currentStep={currentStep} />
            <CardContent className="p-6">
              <div className="space-y-8">
                <section className="space-y-4">
                  <h3 className="font-medium text-[#1A1F2C]">Selected Products</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedProducts.map(product => <div key={product.id} className="border rounded-lg p-4 bg-white">
                        <img src={product.image} alt={product.title} className="w-full h-32 object-cover rounded-lg mb-2" />
                        <h4 className="font-medium text-sm">{product.title}</h4>
                        <p className="text-xs text-[#6D7175]">SKU: {product.sku}</p>
                      </div>)}
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="font-medium text-[#1A1F2C]">Theme</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-[#1A1F2C]">{themeDescription}</p>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="font-medium text-[#1A1F2C]">Content</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm text-[#6D7175] mb-1">Headline</h4>
                      <p className="text-lg font-medium text-[#1A1F2C]">{headline}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-[#6D7175] mb-1">Body Copy</h4>
                      <p className="text-sm text-[#1A1F2C] whitespace-pre-wrap">{bodyCopy}</p>
                    </div>
                  </div>
                </section>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleGenerateHero} disabled={isGenerating} className="bg-[#008060] hover:bg-[#006e52] text-white px-6">
                    {isGenerating ? <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </> : 'Generate Hero Image'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>;

      case 'generation':
        return <Card className="border-0 shadow-sm">
            <CardHeader className="p-6 pb-2">
              <h2 className="text-lg font-semibold text-[#1A1F2C] mb-1">Generation Complete</h2>
              <p className="text-[#6D7175]">Your expose has been generated successfully</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center text-[#6D7175]">
                Hero image and content generated successfully!
              </div>
            </CardContent>
          </Card>;
    }
  };

  return <div className="min-h-screen bg-[#F6F6F7]">
      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <Breadcrumbs className="mb-4" items={[{
          label: 'Home',
          href: '/'
        }, {
          label: 'Create Expose',
          href: '/expose'
        }]} />
          <h1 className="text-[#1A1F2C] text-2xl font-medium mt-4">Create an Expose</h1>
          <p className="text-[#6D7175] mt-1">Generate AI-driven hero images with your products</p>
        </div>

        <div className="max-w-3xl mx-auto">
          {renderStep()}
        </div>
      </div>
    </div>;
};

export default Expose;
