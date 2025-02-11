
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
      console.error('DEEPSEEK_API_KEY not found in environment')
      throw new Error('DEEPSEEK_API_KEY environment variable not set')
    }

    console.log('Making request to Deepseek...')
    console.log('Full prompt:', fullPrompt)

    const url = 'https://api.deepseek.ai/v2/images/generation'
    console.log('Request URL:', url)

    const requestBody = {
      prompt: fullPrompt,
      n: 1,
      size: "1024x1024",
      response_format: "url",
      model: "deepseek-xl"
    }
    console.log('Request body:', JSON.stringify(requestBody))

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    console.log('Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Deepseek API error response:', errorText)
      throw new Error(`Deepseek API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    console.log('Deepseek response data:', data)

    if (!data.data?.[0]?.url) {
      console.error('Invalid response format:', data)
      throw new Error('No image URL in response')
    }

    return new Response(
      JSON.stringify({ imageUrl: data.data[0].url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-fal-images:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    })

    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'An error occurred while generating the image. Please try again.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
