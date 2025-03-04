
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { ImageGallery } from "@/components/ImageGallery";
import { Plus, ArrowLeft, RefreshCw, Copy } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Textarea } from "@/components/ui/textarea";

interface Product {
  id: string;
  title: string;
  image_url: string;
  images: string[];
}

interface Expose {
  id: string;
  headline: string;
  body_copy: string | null;
  hero_image_url: string | null;
  selected_product_ids: string[];
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  negative_prompt?: string;
}

const Expose = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [expose, setExpose] = useState<Expose | null>(null);
  const [headline, setHeadline] = useState("");
  const [bodyCopy, setBodyCopy] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [activeTab, setActiveTab] = useState("products");
  const [generating, setGenerating] = useState(false);
  
  // Fetch expose data if ID is provided
  useEffect(() => {
    const fetchExposeData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('exposes')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        setExpose(data);
        setHeadline(data.headline || "");
        setBodyCopy(data.body_copy || "");
        setNegativePrompt(data.negative_prompt || "");
        
        if (data.selected_product_ids && data.selected_product_ids.length > 0) {
          setSelectedProductId(data.selected_product_ids[0]);
        }
      } catch (error) {
        console.error("Error fetching expose:", error);
        toast({
          title: "Error",
          description: "Failed to load expose data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchExposeData();
  }, [id, toast]);
  
  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*');
          
        if (error) throw error;
        
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [toast]);
  
  // Convert products to images format expected by ImageGallery
  const productImages = products.map(product => ({
    id: product.id,
    url: product.image_url || '/placeholder.svg',
    selected: product.id === selectedProductId,
    title: product.title
  }));
  
  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
  };
  
  const handleRemoveProduct = () => {
    setSelectedProductId(null);
  };

  const handleSave = async () => {
    try {
      const exposeData: Partial<Expose> = {
        headline,
        body_copy: bodyCopy,
        selected_product_ids: selectedProductId ? [selectedProductId] : [],
        negative_prompt: negativePrompt,
      };
      
      if (id) {
        // Update existing expose
        const { error } = await supabase
          .from('exposes')
          .update(exposeData)
          .eq('id', id);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Expose updated successfully",
        });
      } else {
        // Create new expose
        const { data, error } = await supabase
          .from('exposes')
          .insert({
            ...exposeData,
            status: 'draft',
          })
          .select();
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Expose created successfully",
        });
        
        // Navigate to the edit page for the new expose
        if (data && data.length > 0) {
          navigate(`/expose/${data[0].id}`);
        }
      }
    } catch (error) {
      console.error("Error saving expose:", error);
      toast({
        title: "Error",
        description: "Failed to save expose",
        variant: "destructive",
      });
    }
  };

  const handleGenerateImage = async () => {
    if (!selectedProductId) {
      toast({
        title: "Error",
        description: "Please select a product first",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setGenerating(true);
      
      // Here you would call your generate-ai-image function
      // For now we'll just simulate it with a delay
      
      toast({
        title: "Generating",
        description: "Your AI image is being generated. This may take a minute.",
      });
      
      setTimeout(() => {
        setGenerating(false);
        toast({
          title: "Success",
          description: "Image generation completed",
        });
      }, 3000);
      
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Error",
        description: "Failed to generate image",
        variant: "destructive",
      });
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <Breadcrumbs 
          items={[
            { label: "Home", href: "/" },
            { label: "Library", href: "/library" },
            { label: id ? "Edit Expose" : "New Expose", href: "#" }
          ]} 
        />
        
        <div className="flex justify-between items-center my-6">
          <PageHeader
            title={id ? "Edit Expose" : "Create New Expose"}
            description="Generate AI-powered product imagery"
          />
          
          <div className="flex gap-2">
            <Button variant="plain" asChild>
              <Link to="/library">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Library
              </Link>
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSave}
              disabled={loading}
            >
              Save Expose
            </Button>
          </div>
        </div>
      </div>

      <Tabs
        defaultValue="products"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="bg-[#F6F6F7] p-0 h-auto border-b border-[#E3E5E7]">
          <TabsTrigger 
            value="products" 
            className="px-6 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#2C6ECB] rounded-none"
          >
            Select Products
          </TabsTrigger>
          <TabsTrigger 
            value="content" 
            className="px-6 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#2C6ECB] rounded-none"
          >
            Content & Theme
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-medium text-[#1A1F2C]">
                Select a Product
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-48 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <ImageGallery 
                  images={productImages}
                  onSelect={handleSelectProduct}
                  onRemove={handleRemoveProduct}
                />
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button 
              variant="primary" 
              onClick={() => setActiveTab('content')}
              disabled={!selectedProductId}
            >
              Continue to Content
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-medium text-[#1A1F2C]">
                  Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6D7175] mb-1">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-[#BABEC3] rounded-md"
                    placeholder="Enter a headline for your expose"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#6D7175] mb-1">
                    Body Copy
                  </label>
                  <Textarea
                    value={bodyCopy}
                    onChange={(e) => setBodyCopy(e.target.value)}
                    placeholder="Enter description text for your expose"
                    className="min-h-[120px]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#6D7175] mb-1">
                    Negative Prompt
                  </label>
                  <Textarea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="Enter terms to exclude from the AI generation"
                    className="min-h-[80px]"
                  />
                  <p className="text-xs text-[#6D7175] mt-1">
                    Use negative prompts to specify what you don't want to see in the generated image
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-medium text-[#1A1F2C]">
                  Preview & Generate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-w-16 aspect-h-9 bg-[#F6F6F7] rounded-md flex items-center justify-center">
                  {expose?.hero_image_url ? (
                    <img 
                      src={expose.hero_image_url} 
                      alt="Expose hero" 
                      className="object-cover rounded-md w-full h-full"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <p className="text-[#6D7175]">Generate an image to preview it here</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    variant="primary"
                    onClick={handleGenerateImage}
                    disabled={generating || !selectedProductId}
                    className="w-full"
                  >
                    {generating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Image
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="plain"
              onClick={() => setActiveTab('products')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
            
            <Button 
              variant="primary" 
              onClick={handleSave}
            >
              Save Expose
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Expose;
