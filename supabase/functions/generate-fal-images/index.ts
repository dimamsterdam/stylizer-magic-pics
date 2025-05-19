
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const requestBody = await req.json();
    const { exposeId, products, theme, headline, bodyCopy, slides, isMultiSlide } = requestBody;

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    if (!exposeId) {
      throw new Error('exposeId is required');
    }

    const falKey = Deno.env.get('FAL_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!falKey) {
      throw new Error('FAL API key is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Update the expose record to indicate generation has started
    const { error: updateStartError } = await supabase
      .from('exposes')
      .update({
        hero_image_generation_status: 'processing',
        is_multi_slide: !!isMultiSlide
      })
      .eq('id', exposeId);
      
    if (updateStartError) {
      console.error('Error updating expose to processing state:', updateStartError);
    }

    console.log('Preparing FAL AI requests...');

    if (isMultiSlide && Array.isArray(slides)) {
      // Handle multi-slide generation
      console.log(`Processing ${slides.length} slides for multi-slide spotlight`);
      
      const processedSlides = [];
      
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        console.log(`Generating slide ${i + 1}/${slides.length}: ${slide.text.substring(0, 50)}...`);
        
        try {
          // Generate 2 variations for each slide
          const variations = [];
          
          for (let v = 0; v < 2; v++) {
            console.log(`Generating variation ${v + 1}/2 for slide ${i + 1}`);
            
            const falResponse = await fetch('https://queue.fal.run/fal-ai/flux-pro/finetuned', {
              method: 'POST',
              headers: {
                'Authorization': `Key ${falKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                seed: Math.floor(Math.random() * 9999999),
                prompt: slide.text,
                image_size: "landscape_4_3",
                num_images: 1,
                finetune_id: "ca8516ba-1e40-4f58-bf59-83b2d6c5f1d0", // Default finetune ID for product photography
                output_format: "jpeg",
                guidance_scale: 3.5,
                finetune_strength: 1.3,
                num_inference_steps: 44
              }),
            });

            if (!falResponse.ok) {
              const errorText = await falResponse.text();
              console.error(`FAL AI error response for slide ${i + 1}, variation ${v + 1}:`, errorText);
              throw new Error(`FAL AI error (${falResponse.status}): ${errorText}`);
            }

            const responseText = await falResponse.text();
            const falData = JSON.parse(responseText);
            
            if (!falData.images?.[0]?.url) {
              throw new Error('Invalid response format from FAL AI - missing image URL');
            }

            variations.push(falData.images[0].url);
            console.log(`Successfully generated variation ${v + 1} for slide ${i + 1}`);
          }
          
          // Add slide with variations to processed slides array
          processedSlides.push({
            ...slide,
            variations,
            selectedVariation: 0,
            imageUrl: variations[0] // Default to first variation
          });
          
        } catch (slideError) {
          console.error(`Error generating variations for slide ${i + 1}:`, slideError);
          // Add slide with error status
          processedSlides.push({
            ...slide,
            status: 'error',
            error: slideError.message
          });
        }
      }

      // Update expose with all processed slides
      const { error: updateError } = await supabase
        .from('exposes')
        .update({
          hero_image_generation_status: 'completed',
          slides: processedSlides,
          slide_order: processedSlides.map((_, index) => index),
          headline,
          body_copy: bodyCopy,
          hero_image_url: processedSlides[0]?.variations?.[0] || null // Use first slide's first variation as hero
        })
        .eq('id', exposeId);

      if (updateError) {
        console.error('Error updating expose with generated slides:', updateError);
        throw new Error(`Failed to update expose: ${updateError.message}`);
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          slideCount: processedSlides.length,
          slidesWithErrors: processedSlides.filter(s => s.status === 'error').length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Original single-image logic
      const basePrompt = `High-quality professional product photography in ${theme} style featuring ${products.map(p => p.title).join(', ')}. ${headline}`;
      console.log('Base prompt:', basePrompt);
      
      // Generate variations with slightly different prompts
      const prompts = [
        basePrompt + " Main hero shot.",
        basePrompt + " Alternative angle.",
        basePrompt + " Close-up detail view.",
        basePrompt + " Lifestyle context shot."
      ];

      console.log('Generating multiple variations...');
      
      const imageUrls: string[] = [];
      
      // Generate images sequentially
      for (const prompt of prompts) {
        console.log('Generating variation with prompt:', prompt);
        
        try {
          const falResponse = await fetch('https://queue.fal.run/fal-ai/flux-pro/finetuned', {
            method: 'POST',
            headers: {
              'Authorization': `Key ${falKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              seed: Math.floor(Math.random() * 9999999),
              prompt: prompt,
              image_size: "landscape_4_3",
              num_images: 1,
              finetune_id: "ca8516ba-1e40-4f58-bf59-83b2d6c5f1d0", // Default finetune ID for product photography
              output_format: "jpeg",
              guidance_scale: 3.5,
              finetune_strength: 1.3,
              num_inference_steps: 44
            }),
          });

          if (!falResponse.ok) {
            const errorText = await falResponse.text();
            console.error('FAL AI error response:', errorText);
            throw new Error(`FAL AI error (${falResponse.status}): ${errorText}`);
          }

          const responseText = await falResponse.text();
          const falData = JSON.parse(responseText);
          
          if (!falData.images?.[0]?.url) {
            throw new Error('Invalid response format from FAL AI - missing image URL');
          }

          const imageUrl = falData.images[0].url;
          console.log('Generated image URL:', imageUrl);
          imageUrls.push(imageUrl);
          
        } catch (imageGenError) {
          console.error('Error generating image variation:', imageGenError);
          // Continue with other variations even if one fails
        }
      }

      console.log(`Successfully generated ${imageUrls.length} image variations`);
      
      if (imageUrls.length === 0) {
        throw new Error('Failed to generate any images');
      }

      // Save the first successful image as the main hero image
      const { error: updateError } = await supabase
        .from('exposes')
        .update({
          hero_image_generation_status: 'completed',
          hero_image_url: imageUrls[0],
          hero_image_desktop_url: imageUrls[0],
          hero_image_tablet_url: imageUrls[0],
          hero_image_mobile_url: imageUrls[0],
          image_variations: imageUrls,
          selected_variation_index: 0
        })
        .eq('id', exposeId);

      if (updateError) {
        console.error('Error updating expose with generated images:', updateError);
        throw new Error(`Failed to update expose: ${updateError.message}`);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          imageCount: imageUrls.length,
          mainImageUrl: imageUrls[0] 
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in generate-fal-images function:', error);
    
    // Try to update the expose status to error if possible
    try {
      const requestBody = await req.json();
      const { exposeId } = requestBody;
      
      if (exposeId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        await supabase
          .from('exposes')
          .update({
            hero_image_generation_status: 'error',
            error_message: error.message || 'Unknown error'
          })
          .eq('id', exposeId);
      }
    } catch (updateError) {
      console.error('Failed to update expose with error status:', updateError);
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        details: 'An error occurred during image generation. Check server logs for more details.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
