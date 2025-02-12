
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

async function testDeepseekAPI() {
  const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not set');
  }

  const response = await fetch('https://api.deepseek.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: "test connection",
      n: 1,
      size: "256x256",
      response_format: "url"
    })
  });

  if (!response.ok) {
    throw new Error(`Deepseek API error: ${response.status}`);
  }

  return await response.json();
}

async function testFalAPI() {
  const apiKey = Deno.env.get('FAL_KEY');
  if (!apiKey) {
    throw new Error('FAL_KEY is not set');
  }

  const response = await fetch('https://fal.run/v1/stable-diffusion/text-to-image', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: "test connection",
      model_name: "stabilityai/stable-diffusion-xl-base-1.0",
      image_size: "256x256",
      num_inference_steps: 10,
      guidance_scale: 7.5,
      num_images: 1,
      safety_checker: true
    })
  });

  if (!response.ok) {
    throw new Error(`FAL API error: ${response.status}`);
  }

  return await response.json();
}

async function testPerplexityAPI() {
  const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY is not set');
  }

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: 'Test connection.'
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.status}`);
  }

  return await response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const timestamp = new Date().toISOString();
  const results = [];
  let allTestsPassed = true;

  try {
    // Get current provider from feature flags
    const { data: featureFlags, error: flagError } = await supabase
      .from('feature_flags')
      .select('value')
      .eq('name', 'ai_provider')
      .maybeSingle();

    if (flagError) {
      throw new Error(`Error fetching AI provider: ${flagError.message}`);
    }

    const provider = featureFlags?.value || 'deepseek';
    console.log('Testing provider:', provider);

    // Only test the currently selected provider
    try {
      let testResult;
      switch (provider) {
        case 'deepseek':
          testResult = await testDeepseekAPI();
          results.push({
            step: "Deepseek API Connection",
            success: true,
            details: {
              message: "Successfully connected to Deepseek API",
              response: testResult
            }
          });
          break;

        case 'fal':
          testResult = await testFalAPI();
          results.push({
            step: "FAL API Connection",
            success: true,
            details: {
              message: "Successfully connected to FAL API",
              response: testResult
            }
          });
          break;

        case 'perplexity':
          testResult = await testPerplexityAPI();
          results.push({
            step: "Perplexity API Connection",
            success: true,
            details: {
              message: "Successfully connected to Perplexity API",
              response: testResult
            }
          });
          break;

        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
    } catch (error) {
      allTestsPassed = false;
      results.push({
        step: `${provider.charAt(0).toUpperCase() + provider.slice(1)} API Connection`,
        success: false,
        details: {
          message: `Failed to connect to ${provider} API`,
          error: error.message
        }
      });
    }

    return new Response(
      JSON.stringify({
        timestamp,
        results,
        allTestsPassed
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in test function:', error);
    return new Response(
      JSON.stringify({
        timestamp,
        error: 'Failed to run tests',
        details: error.message,
        results,
        allTestsPassed: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
