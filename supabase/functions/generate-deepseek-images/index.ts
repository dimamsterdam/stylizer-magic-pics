
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, productId, angle } = await req.json()
    console.log('Request received:', { prompt, productId, angle })

    const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY')
    if (!deepseekKey) {
      throw new Error('DEEPSEEK_API_KEY environment variable not set')
    }

    const fullPrompt = `${prompt}. ${angle} shot of the product.`
    console.log('Full prompt:', fullPrompt)

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
    })

    console.log('Response status:', response.status)
    const responseText = await response.text()
    console.log('Response body:', responseText)

    if (!response.ok) {
      throw new Error(`Deepseek API error (${response.status}): ${responseText}`)
    }

    try {
      const data = JSON.parse(responseText)
      if (!data.data?.[0]?.url) {
        throw new Error('No image URL in response')
      }
      return new Response(
        JSON.stringify({ imageUrl: data.data[0].url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (parseError) {
      console.error('Error parsing response:', parseError)
      throw new Error(`Invalid JSON response: ${responseText}`)
    }

  } catch (error) {
    console.error('Error in generate-deepseek-images:', {
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
