
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, productId, angle } = await req.json()
    console.log('Generating image with:', { prompt, productId, angle })

    // Construct the full prompt for Deepseek
    const fullPrompt = `${prompt}. ${angle} shot of the product.`

    // Get Deepseek key from environment
    const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY')
    if (!deepseekKey) {
      throw new Error('DEEPSEEK_API_KEY environment variable not set')
    }

    console.log('Making request to Deepseek...')

    try {
      const response = await fetch('https://api.deepseek.ai/v2/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${deepseekKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          n: 1,
          size: "1024x1024",
          response_format: "url",
          model: "deepseek-xl"
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Deepseek API error:', errorData);
        throw new Error(`Deepseek API error: ${errorData}`);
      }

      const data = await response.json();
      console.log('Deepseek response:', data);

      if (!data.data?.[0]?.url) {
        throw new Error('No image URL in response');
      }

      return new Response(
        JSON.stringify({ imageUrl: data.data[0].url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }

  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'An error occurred while generating the image. Please try again.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
