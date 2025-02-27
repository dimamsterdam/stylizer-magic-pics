
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
