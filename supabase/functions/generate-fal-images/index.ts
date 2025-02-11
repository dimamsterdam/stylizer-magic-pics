
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

    // Construct the full prompt for FAL AI
    const fullPrompt = `${prompt}. ${angle} shot of the product.`

    // Call FAL AI API
    const response = await fetch('https://110602490-fal-image-generation.gateway.alpha.fal.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${Deno.env.get('FAL_KEY')}`,
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        image_size: "1024x1024",
        num_images: 1,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('FAL AI API error:', error)
      throw new Error(`FAL AI API error: ${error}`)
    }

    const data = await response.json()
    console.log('FAL AI response:', data)

    return new Response(
      JSON.stringify({ 
        imageUrl: data.images[0].url,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
