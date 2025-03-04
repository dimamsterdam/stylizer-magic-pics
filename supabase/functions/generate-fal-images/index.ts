
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
    const { exposeId, products, theme, headline, bodyCopy } = requestBody;

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

    console.log('Preparing FAL AI requests...');

    const basePrompt = `High-quality professional product photography in ${theme} style featuring ${products.map(p => p.title).join(', ')}. ${headline}`;
    
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
        throw new Error(`FAL AI error: ${errorText}`);
      }

      const falData = await falResponse.json();
      console.log('FAL AI response:', JSON.stringify(falData, null, 2));

      if (!falData.images?.[0]?.url) {
        throw new Error('Invalid response format from FAL AI');
      }

      imageUrls.push(falData.images[0].url);
    }

    console.log(`Generated ${imageUrls.length} image variations`);

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
      throw new Error(`Failed to update expose: ${updateError.message}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-fal-images function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
