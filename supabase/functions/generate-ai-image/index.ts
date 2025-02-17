
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { products, theme, headline, bodyCopy, exposeId } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update status to generating
    await supabase
      .from('exposes')
      .update({ hero_image_generation_status: 'generating' })
      .eq('id', exposeId);

    // Fetch current AI provider from feature flags
    const { data: featureFlags, error: flagError } = await supabase
      .from('feature_flags')
      .select('value')
      .eq('name', 'ai_provider')
      .single();

    if (flagError) {
      throw new Error(`Error fetching AI provider: ${flagError.message}`);
    }

    // Common prompt structure for all sizes
    const basePrompt = `Create a professional e-commerce hero banner image featuring ${products.map(p => p.title).join(', ')}. 
    Theme description: ${theme}
    Headline: ${headline}
    Content context: ${bodyCopy}
    Style: Modern e-commerce hero banner, high-end product photography
    Requirements: Clear product focus, professional lighting, engaging composition`;

    // Generate images for different sizes
    const sizes = [
      { name: 'desktop', width: 1920, height: 750 },
      { name: 'tablet', width: 1024, height: 400 },
      { name: 'mobile', width: 640, height: 400 }
    ];

    const imageUrls: Record<string, string> = {};

    for (const size of sizes) {
      const sizePrompt = `${basePrompt}
      Image size: ${size.width}x${size.height}px
      Viewport: ${size.name} view`;

      let imageUrl;
      switch (featureFlags.value) {
        case 'fal':
          imageUrl = await generateWithFal(sizePrompt, size);
          break;
        case 'deepseek':
          imageUrl = await generateWithDeepseek(sizePrompt);
          break;
        default:
          throw new Error(`Unknown AI provider: ${featureFlags.value}`);
      }

      imageUrls[`hero_image_${size.name}_url`] = imageUrl;

      // Update the database with each generated image
      await supabase
        .from('exposes')
        .update({
          [`hero_image_${size.name}_url`]: imageUrl,
        })
        .eq('id', exposeId);
    }

    // Update final status
    await supabase
      .from('exposes')
      .update({
        hero_image_generation_status: 'completed',
      })
      .eq('id', exposeId);

    return new Response(
      JSON.stringify({ imageUrls }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

async function generateWithFal(prompt: string, size: { width: number, height: number }) {
  const falKey = Deno.env.get('FAL_KEY')!;

  try {
    const response = await fetch('https://fal.run/api/v1/art/models/1.6-turbo', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        image_size: `${size.width}x${size.height}`,
        num_images: 1,
        output_format: "jpeg",
        guidance_scale: 7.5,
        num_inference_steps: 50
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FAL API error response:', errorText);
      throw new Error(`FAL API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.id) {
      throw new Error('No request ID in FAL API response');
    }

    const imageResult = await waitForImageGeneration(data.id, falKey);
    if (!imageResult.image?.url) {
      throw new Error('No image URL in FAL API response');
    }

    return imageResult.image.url;
  } catch (error) {
    console.error('Error in generateWithFal:', error);
    throw error;
  }
}

async function generateWithDeepseek(prompt: string) {
  const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY')!;
  
  const response = await fetch('https://api.deepseek.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${deepseekKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      n: 1,
      size: "1024x1024",
      response_format: "url"
    })
  });

  if (!response.ok) {
    throw new Error(`Deepseek API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].url;
}

async function waitForImageGeneration(requestId: string, apiKey: string) {
  const maxAttempts = 30;
  const delayMs = 1000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(`https://fal.run/api/v1/art/requests/${requestId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Key ${apiKey}`,
          'Accept': 'application/json'
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Status check attempt ${attempt + 1} failed:`, errorText);
        throw new Error(`Status check failed: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Status check attempt ${attempt + 1} result:`, result);

      if (result.status === 'completed') {
        return result;
      } else if (result.status === 'failed') {
        throw new Error('Image generation failed: ' + (result.error || 'Unknown error'));
      }

      await new Promise(resolve => setTimeout(resolve, delayMs));
    } catch (error) {
      console.error(`Error in attempt ${attempt + 1}:`, error);
      throw error;
    }
  }

  throw new Error('Timeout waiting for image generation');
}
