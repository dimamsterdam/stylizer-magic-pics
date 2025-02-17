
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('Received request body:', requestBody);

    // Validate required fields
    if (!requestBody) {
      throw new Error('Request body is missing');
    }

    const { exposeId, products, theme, headline, bodyCopy } = requestBody;

    if (!exposeId) {
      throw new Error('exposeId is required');
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      throw new Error('products array is required and must not be empty');
    }

    // Get environment variables
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!openaiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Preparing DALL-E request...');

    const prompt = `High-quality professional product photography in ${theme} style featuring ${products.map(p => p.title).join(', ')}. ${headline}`;
    console.log('DALL-E prompt:', prompt);

    const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        style: "natural"
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('DALL-E API error response:', errorText);
      throw new Error(`DALL-E API error: ${errorText}`);
    }

    const openaiData = await openaiResponse.json();
    console.log('DALL-E API response:', JSON.stringify(openaiData, null, 2));

    if (!openaiData.data?.[0]?.url) {
      throw new Error('Invalid response format from DALL-E API');
    }

    const imageUrl = openaiData.data[0].url;
    console.log(`Generated image URL: ${imageUrl}`);

    // Update expose with generation status and all image URLs
    const { error: updateError } = await supabase
      .from('exposes')
      .update({
        hero_image_generation_status: 'completed',
        hero_image_url: imageUrl,
        hero_image_desktop_url: imageUrl,
        hero_image_tablet_url: imageUrl,
        hero_image_mobile_url: imageUrl
      })
      .eq('id', exposeId);

    if (updateError) {
      throw new Error(`Failed to update expose: ${updateError.message}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-ai-image function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
