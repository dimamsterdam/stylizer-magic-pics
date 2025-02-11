
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

    // Get FAL key from environment
    const falKey = Deno.env.get('FAL_KEY')
    if (!falKey) {
      throw new Error('FAL_KEY environment variable not set')
    }

    console.log('Making request to FAL AI...')

    try {
      // Use native fetch with all required options
      const response = await fetch('https://api.fal.ai/v1/text-to-image', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${falKey}`,
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          image_size: "1024x1024",
          num_images: 1,
          model: 'sd-xl',
          sync: true
        }),
        cache: 'no-cache',
        signal: AbortSignal.timeout(30000) // 30 second timeout
      })

      console.log('FAL AI response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('FAL AI API error response:', errorText)
        throw new Error(`FAL AI API error: ${errorText}`)
      }

      const data = await response.json()
      console.log('FAL AI successful response:', data)

      return new Response(
        JSON.stringify({ 
          imageUrl: data.images[0].url,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } catch (fetchError) {
      console.error('Fetch error details:', {
        message: fetchError.message,
        cause: fetchError.cause,
        stack: fetchError.stack
      })
      throw new Error(`Failed to communicate with FAL AI: ${fetchError.message}`)
    }
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    })
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
