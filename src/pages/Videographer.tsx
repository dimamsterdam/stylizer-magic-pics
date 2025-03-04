import React, { useState } from 'react';
import { ProductPicker } from '@/components/ProductPicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/ui/page-header';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight, Image, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  title: string;
  sku: string;
  image: string;
  images?: string[];
}

const Videographer = () => {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('select-product');

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    toast({
      title: "Product selected",
      description: `${product.title} has been selected.`
    });
    setActiveTab('select-images');
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch products from Shopify via Supabase edge function
      const { data, error: functionError } = await supabase.functions.invoke('sync-shopify-products', {
        body: { searchTerm: term }
      });

      if (functionError) throw functionError;
      
      setSearchResults(data.products || []);
    } catch (error) {
      console.error('Error searching products:', error);
      setError('Failed to search products. Please try again.');
      toast({
        title: "Error",
        description: "Failed to search products. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    if (selectedImages.includes(imageUrl)) {
      setSelectedImages(selectedImages.filter(img => img !== imageUrl));
    } else {
      setSelectedImages([...selectedImages, imageUrl]);
    }
  };

  const handleContinue = () => {
    if (selectedImages.length === 0) {
      toast({
        title: "No images selected",
        description: "Please select at least one image to continue.",
        variant: "destructive"
      });
      return;
    }
    setActiveTab('select-style');
  };

  const renderProductSelection = () => (
    <Card className="border-0 shadow-sm">
      <CardHeader className="p-6 pb-2">
        <h2 className="text-headingLg font-medium text-polaris-text">Select a Product</h2>
        <p className="text-bodySm text-polaris-text-subdued">
          Search and select a product from your Shopify store
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <ProductPicker
          onSelect={handleProductSelect}
          selectedProducts={selectedProduct ? [selectedProduct] : []}
          searchResults={searchResults}
          isLoading={isLoading}
          error={error}
          searchTerm={searchTerm}
          onSearch={handleSearch}
        />
      </CardContent>
    </Card>
  );

  const renderImageGallery = () => {
    if (!selectedProduct) return null;
    
    // Mock product images for now
    const productImages = selectedProduct.images || [
      selectedProduct.image,
      // Add more mock images if needed for testing
    ];
    
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="p-6 pb-2">
          <h2 className="text-headingLg font-medium text-polaris-text">Select Images</h2>
          <p className="text-bodySm text-polaris-text-subdued">
            Choose one or more images to create video animations
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {productImages.map((imageUrl, index) => (
              <div 
                key={`${selectedProduct.id}-image-${index}`}
                className={`relative cursor-pointer group ${
                  selectedImages.includes(imageUrl) 
                    ? "ring-2 ring-polaris-teal rounded-lg" 
                    : ""
                }`}
                onClick={() => handleImageSelect(imageUrl)}
              >
                <img 
                  src={imageUrl} 
                  alt={`${selectedProduct.title} - Image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                {selectedImages.includes(imageUrl) && (
                  <div className="absolute top-2 left-2">
                    <div className="bg-polaris-teal rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleContinue}
              disabled={selectedImages.length === 0}
              variant="primary"
            >
              Continue
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Videographer"
        description="Transform product images into engaging video animations"
      >
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="/videographer" isCurrentPage>Videographer</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="select-product" disabled={activeTab === 'select-images' || activeTab === 'select-style'}>
            1. Select Product
          </TabsTrigger>
          <TabsTrigger value="select-images" disabled={!selectedProduct || activeTab === 'select-style'}>
            2. Select Images
          </TabsTrigger>
          <TabsTrigger value="select-style" disabled={selectedImages.length === 0}>
            3. Select Animation Styles
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="select-product">
          {renderProductSelection()}
        </TabsContent>
        
        <TabsContent value="select-images">
          {renderImageGallery()}
        </TabsContent>
        
        <TabsContent value="select-style">
          <Card className="border-0 shadow-sm">
            <CardHeader className="p-6 pb-2">
              <h2 className="text-headingLg font-medium text-polaris-text">Select Animation Style</h2>
              <p className="text-bodySm text-polaris-text-subdued">
                Choose a video animation style for each selected image
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-center text-polaris-text-subdued py-12">
                Video style selection coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Videographer;
