import React, { useState } from 'react';
import { ProductPicker } from '@/components/ProductPicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/ui/page-header';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MoveHorizontal, ArrowDownFromLine, ArrowUpFromLine, Expand, Play, ChevronRight, Download, CheckCircle, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ImageGallery } from '@/components/ImageGallery';
import { Product } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoStyle {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  preview?: string;
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
  const [selectedStyles, setSelectedStyles] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [generatedVideos, setGeneratedVideos] = useState<Record<string, {
    video1: string;
    video2: string;
    style: string;
    thumbnail: string;
    selected?: 'video1' | 'video2' | 'both';
  }>>({});

  const videoStyles: VideoStyle[] = [
    {
      id: 'horizontal-pan',
      name: '180° Horizontal Pan',
      description: 'The image moves horizontally across the frame',
      icon: <MoveHorizontal className="h-5 w-5" />,
      preview: '/placeholder.svg'
    },
    {
      id: 'bottom-top-zoom',
      name: 'Bottom to Top Zoom',
      description: 'The image zooms in from the bottom to the top',
      icon: <ArrowUpFromLine className="h-5 w-5" />,
      preview: '/placeholder.svg'
    },
    {
      id: 'top-bottom-zoom',
      name: 'Top to Bottom Zoom',
      description: 'The image zooms in from the top to the bottom',
      icon: <ArrowDownFromLine className="h-5 w-5" />,
      preview: '/placeholder.svg'
    },
    {
      id: 'center-zoom',
      name: 'Center Zoom',
      description: 'The image zooms in from the center outward',
      icon: <Expand className="h-5 w-5" />,
      preview: '/placeholder.svg'
    }
  ];

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
      const updatedStyles = { ...selectedStyles };
      delete updatedStyles[imageUrl];
      setSelectedStyles(updatedStyles);
    } else {
      setSelectedImages([...selectedImages, imageUrl]);
    }
  };

  const handleStyleSelect = (imageUrl: string, styleId: string) => {
    setSelectedStyles({
      ...selectedStyles,
      [imageUrl]: styleId
    });
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

  const handleGoBack = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleGenerateVideos = async () => {
    const imagesWithoutStyles = selectedImages.filter(img => !selectedStyles[img]);
    
    if (imagesWithoutStyles.length > 0) {
      toast({
        title: "Missing style selections",
        description: `Please select styles for all images (${imagesWithoutStyles.length} remaining).`,
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      toast({
        title: "Video generation started",
        description: "Your videos are being generated. This may take a few minutes."
      });
      
      const newGeneratedVideos: Record<string, any> = {};
      
      selectedImages.forEach((img, index) => {
        const style = videoStyles.find(s => s.id === selectedStyles[img]);
        newGeneratedVideos[img] = {
          video1: `/placeholder.svg`,
          video2: `/placeholder.svg`,
          style: style?.name || 'Animation',
          thumbnail: img,
          selected: undefined
        };
      });
      
      setTimeout(() => {
        setIsGenerating(false);
        setGeneratedVideos(newGeneratedVideos);
        setActiveTab('review-videos');
        toast({
          title: "Videos generated",
          description: "Your videos have been successfully generated."
        });
      }, 3000);
    } catch (error) {
      console.error('Error generating videos:', error);
      setIsGenerating(false);
      toast({
        title: "Error",
        description: "Failed to generate videos. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleVideoSelect = (imageUrl: string, videoType: 'video1' | 'video2') => {
    const updatedVideos = { ...generatedVideos };
    
    if (updatedVideos[imageUrl].selected === videoType) {
      updatedVideos[imageUrl].selected = undefined;
    } else {
      updatedVideos[imageUrl].selected = videoType;
    }
    
    setGeneratedVideos(updatedVideos);
    
    toast({
      title: "Video selected",
      description: updatedVideos[imageUrl].selected 
        ? `Video ${videoType === 'video1' ? '1' : '2'} has been selected` 
        : "Video selection removed"
    });
  };

  const handleDownloadVideo = (videoUrl: string) => {
    toast({
      title: "Download started",
      description: "Your video is being downloaded."
    });
  };

  const handleSendToShopify = () => {
    const selectedCount = Object.values(generatedVideos).filter(v => v.selected).length;
    
    if (selectedCount === 0) {
      toast({
        title: "No videos selected",
        description: "Please select at least one video to send to Shopify.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Sending to Shopify",
      description: `${selectedCount} video${selectedCount > 1 ? 's' : ''} being sent to your Shopify product.`
    });
    
    setTimeout(() => {
      toast({
        title: "Success",
        description: `${selectedCount} video${selectedCount > 1 ? 's' : ''} added to your Shopify product.`
      });
    }, 2000);
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
    
    const productImages = selectedProduct.images && selectedProduct.images.length > 0 
      ? selectedProduct.images 
      : [selectedProduct.image_url];
    
    const galleryImages = productImages.map((url, index) => ({
      id: `${selectedProduct.id}-image-${index}`,
      url,
      selected: selectedImages.includes(url),
      title: `${selectedProduct.title} - Image ${index + 1}`
    }));
    
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="p-6 pb-2">
          <h2 className="text-headingLg font-medium text-polaris-text">Select Images</h2>
          <p className="text-bodySm text-polaris-text-subdued">
            Choose one or more images to create video animations
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <ImageGallery 
            images={galleryImages}
            onSelect={(id) => {
              const image = galleryImages.find(img => img.id === id);
              if (image) handleImageSelect(image.url);
            }}
            onRemove={() => {}} // Not used in this context
          />
          
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

  const renderStyleSelection = () => {
    if (selectedImages.length === 0) return null;
    
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="p-6 pb-2">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2 rounded-full"
              onClick={() => handleGoBack('select-images')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-headingLg font-medium text-polaris-text">Select Animation Styles</h2>
              <p className="text-bodySm text-polaris-text-subdued">
                Choose a video animation style for each selected image
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-8">
            {selectedImages.map((imageUrl, index) => (
              <div key={`selected-image-${index}`} className="border border-[#E3E5E7] rounded-md p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/3">
                    <img 
                      src={imageUrl} 
                      alt={`Selected image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <p className="mt-2 text-center text-sm text-polaris-text-subdued">
                      {selectedProduct?.title} - Image {index + 1}
                    </p>
                  </div>
                  
                  <div className="w-full md:w-2/3">
                    <h3 className="text-headingMd font-medium text-polaris-text mb-3">
                      Select Animation Style
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {videoStyles.map(style => (
                        <div 
                          key={style.id}
                          className={`border ${selectedStyles[imageUrl] === style.id 
                            ? 'border-[#2C6ECB] bg-[#F6F9FC]' 
                            : 'border-[#E3E5E7] hover:border-[#B4B9BE]'} 
                            rounded-md p-3 cursor-pointer transition-colors`}
                          onClick={() => handleStyleSelect(imageUrl, style.id)}
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-8 h-8 bg-[#F6F9FC] rounded-full flex items-center justify-center">
                              {style.icon}
                            </div>
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-polaris-text">{style.name}</h4>
                              <p className="text-xs text-polaris-text-subdued">{style.description}</p>
                            </div>
                            {selectedStyles[imageUrl] === style.id && (
                              <div className="ml-auto">
                                <div className="w-4 h-4 bg-[#2C6ECB] rounded-full flex items-center justify-center">
                                  <svg width="10" height="7" viewBox="0 0 10 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 3.5L3.66667 6L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-end">
            <Button 
              onClick={handleGenerateVideos}
              disabled={isGenerating || selectedImages.some(img => !selectedStyles[img])}
              variant="primary"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Videos...
                </>
              ) : (
                <>
                  Generate Videos
                  <Play className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderVideoPreview = () => {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="p-6 pb-2">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2 rounded-full"
              onClick={() => handleGoBack('select-style')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-headingLg font-medium text-polaris-text">Review Generated Videos</h2>
              <p className="text-bodySm text-polaris-text-subdued">
                Preview your videos and select the ones you want to use
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {Object.keys(generatedVideos).length === 0 ? (
            <p className="text-center text-polaris-text-subdued py-12">
              No videos have been generated yet.
            </p>
          ) : (
            <div className="space-y-8">
              {Object.entries(generatedVideos).map(([imageUrl, videoData], index) => (
                <div key={`video-preview-${index}`} className="border border-[#E3E5E7] rounded-md overflow-hidden">
                  <div className="bg-[#F6F9FC] p-4 border-b border-[#E3E5E7]">
                    <h3 className="text-headingSm font-medium text-polaris-text">
                      {selectedProduct?.title} - Animation {index + 1}
                    </h3>
                    <p className="text-bodySm text-polaris-text-subdued">
                      Style: {videoData.style}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                    <div className="space-y-3">
                      <div className="relative group">
                        <div className="aspect-video bg-[#F6F6F7] rounded-md overflow-hidden flex items-center justify-center">
                          <Skeleton className="w-full h-full" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="h-12 w-12 text-gray-400 opacity-50 group-hover:opacity-75 transition-opacity" />
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 rounded-full bg-white p-1 shadow-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDownloadVideo(videoData.video1)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant={videoData.selected === 'video1' ? 'primary' : 'plain'}
                          size="sm"
                          className="mr-2"
                          onClick={() => handleVideoSelect(imageUrl, 'video1')}
                        >
                          {videoData.selected === 'video1' ? (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          ) : null}
                          Select Option 1
                        </Button>
                        <p className="text-xs text-polaris-text-subdued">
                          1080×1080 • MP4
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="relative group">
                        <div className="aspect-video bg-[#F6F6F7] rounded-md overflow-hidden flex items-center justify-center">
                          <Skeleton className="w-full h-full" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="h-12 w-12 text-gray-400 opacity-50 group-hover:opacity-75 transition-opacity" />
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 rounded-full bg-white p-1 shadow-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDownloadVideo(videoData.video2)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant={videoData.selected === 'video2' ? 'primary' : 'plain'}
                          size="sm"
                          className="mr-2"
                          onClick={() => handleVideoSelect(imageUrl, 'video2')}
                        >
                          {videoData.selected === 'video2' ? (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          ) : null}
                          Select Option 2
                        </Button>
                        <p className="text-xs text-polaris-text-subdued">
                          1080×1080 • MP4
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end mt-6">
                <Button 
                  variant="primary"
                  onClick={handleSendToShopify}
                  className="min-w-32"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Send to Shopify
                </Button>
              </div>
            </div>
          )}
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
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="select-product" disabled={activeTab !== 'select-product'}>
            1. Select Product
          </TabsTrigger>
          <TabsTrigger value="select-images" disabled={!selectedProduct || activeTab === 'select-product' || activeTab === 'review-videos'}>
            2. Select Images
          </TabsTrigger>
          <TabsTrigger value="select-style" disabled={selectedImages.length === 0 || activeTab === 'select-product' || activeTab === 'select-images' || activeTab === 'review-videos'}>
            3. Select Animation Styles
          </TabsTrigger>
          <TabsTrigger value="review-videos" disabled={activeTab !== 'review-videos'}>
            4. Review Videos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="select-product">
          {renderProductSelection()}
        </TabsContent>
        
        <TabsContent value="select-images">
          {renderImageGallery()}
        </TabsContent>
        
        <TabsContent value="select-style">
          {renderStyleSelection()}
        </TabsContent>
        
        <TabsContent value="review-videos">
          {renderVideoPreview()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Videographer;
