
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const falKey = Deno.env.get('FAL_KEY');
const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY');
const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { exposeId, products, theme, headline, bodyCopy } = await req.json();

    // Get the AI provider setting for image generation
    const { data: providerSetting, error: settingError } = await supabase
      .from('ai_provider_settings')
      .select('provider')
      .eq('feature_name', 'expose_image')
      .eq('feature_type', 'image_generation')
      .single();

    if (settingError) {
      throw new Error(`Failed to fetch AI provider setting: ${settingError.message}`);
    }

    let imageUrl;
    const provider = providerSetting.provider;

    console.log(`Using provider: ${provider}`);

    switch (provider) {
      case 'fal':
        if (!falKey) {
          throw new Error('FAL API key is not configured');
        }
        const falResponse = await fetch('https://fal.run/fal-ai/ip-adapter-face-id', {
          method: 'POST',
          headers: {
            'Authorization': `Key ${falKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: `${theme} style product photo featuring ${products.map(p => p.title).join(', ')}. ${headline}`,
            negative_prompt: "blurry, low quality, distorted, deformed",
            image_url: products[0].image,
            num_inference_steps: 30,
            guidance_scale: 7.5,
            seed: Math.floor(Math.random() * 1000000)
          }),
        });

        const falData = await falResponse.json();
        if (!falResponse.ok) {
          throw new Error(`FAL API error: ${falData.error || 'Unknown error'}`);
        }
        imageUrl = falData.image_url;
        break;

      case 'deepseek':
        if (!deepseekKey) {
          throw new Error('Deepseek API key is not configured');
        }
        const deepseekResponse = await fetch('https://api.deepseek.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${deepseekKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: `${theme} style product photo featuring ${products.map(p => p.title).join(', ')}. ${headline}`,
            negative_prompt: "blurry, low quality, distorted, deformed",
            width: 1024,
            height: 1024,
            num_images: 1,
            guidance_scale: 7.5,
            seed: Math.floor(Math.random() * 1000000)
          }),
        });

        const deepseekData = await deepseekResponse.json();
        if (!deepseekResponse.ok) {
          throw new Error(`Deepseek API error: ${deepseekData.error?.message || 'Unknown error'}`);
        }
        imageUrl = deepseekData.data[0].url;
        break;

      case 'imagen':
        if (!googleApiKey) {
          throw new Error('Google API key is not configured');
        }

        console.log('Preparing Imagen request...');

        const prompt = `High-quality professional product photography in ${theme} style featuring ${products.map(p => p.title).join(', ')}. ${headline}`;
        console.log('Imagen prompt:', prompt);

        const imagenResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro-vision-latest:generateContent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': googleApiKey,
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.4,
              topK: 32,
              topP: 1,
              maxOutputTokens: 2048,
            },
            safetySettings: [{
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }, {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }, {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }, {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }]
          }),
        });

        if (!imagenResponse.ok) {
          const errorText = await imagenResponse.text();
          console.error('Imagen API error response:', errorText);
          throw new Error(`Google Imagen API error: ${errorText}`);
        }

        const imagenData = await imagenResponse.json();
        console.log('Imagen API response:', JSON.stringify(imagenData, null, 2));

        if (!imagenData.candidates || !imagenData.candidates[0]?.content?.parts[0]?.text) {
          throw new Error('Invalid response format from Imagen API');
        }

        // For Imagen, we get back a URL in the response text
        imageUrl = imagenData.candidates[0].content.parts[0].text;
        
        // Verify the URL is valid
        if (!imageUrl.startsWith('http')) {
          throw new Error('Invalid image URL received from Imagen API');
        }

        break;

      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }

    console.log(`Generated image URL: ${imageUrl}`);

    // Update expose with generation status
    const { error: updateError } = await supabase
      .from('exposes')
      .update({
        hero_image_generation_status: 'completed',
        hero_image_url: imageUrl
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
