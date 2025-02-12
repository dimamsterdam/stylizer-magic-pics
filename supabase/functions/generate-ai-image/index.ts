import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

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

async function generateWithPerplexity(prompt: string) {
  const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY')!;

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${perplexityKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: 'Generate an image based on the following prompt.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateWithFal(prompt: string) {
  const falKey = Deno.env.get('FAL_KEY')!;
  console.log('Generating image with FAL, prompt:', prompt);

  try {
    const response = await fetch('https://110602490-fast-stable-diffusion.fal.run/v1/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_size: "1024x1024",
        num_inference_steps: 30,
        guidance_scale: 7.5,
        num_images: 1,
        safety_filter: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FAL API error response:', errorText);
      throw new Error(`FAL API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('FAL API response:', data);

    if (!data.images || !data.images[0]) {
      throw new Error('No image generated by FAL API');
    }

    return data.images[0];
  } catch (error) {
    console.error('Error in generateWithFal:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt } = await req.json();

    // Fetch current AI provider from feature flags
    const { data: featureFlags, error: flagError } = await supabase
      .from('feature_flags')
      .select('value')
      .eq('name', 'ai_provider')
      .single();

    if (flagError) {
      throw new Error(`Error fetching AI provider: ${flagError.message}`);
    }

    const provider = featureFlags.value;
    console.log('Using AI provider:', provider);

    let imageUrl;
    switch (provider) {
      case 'deepseek':
        imageUrl = await generateWithDeepseek(prompt);
        break;
      case 'perplexity':
        imageUrl = await generateWithPerplexity(prompt);
        break;
      case 'fal':
        imageUrl = await generateWithFal(prompt);
        break;
      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to generate image'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
