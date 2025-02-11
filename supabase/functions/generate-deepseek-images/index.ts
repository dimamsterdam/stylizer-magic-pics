
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

    const requestBody = {
      prompt: fullPrompt,
      n: 1,
      size: "1024x1024",
      response_format: "url",
      model: "deepseek/xl"
    }
    console.log('Sending request to Deepseek:', requestBody)

    const response = await fetch('https://api.deepseek.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    console.log('Deepseek response status:', response.status)
    console.log('Deepseek response headers:', Object.fromEntries(response.headers.entries()))
    
    const responseText = await response.text()
    console.log('Deepseek response body:', responseText)

    if (!response.ok) {
      throw new Error(`Deepseek API error (${response.status}): ${responseText}`)
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Error parsing response:', parseError)
      throw new Error(`Invalid JSON response from Deepseek: ${responseText}`)
    }

    if (!data.data?.[0]?.url) {
      console.error('Unexpected response structure:', data)
      throw new Error('No image URL in Deepseek response')
    }

    console.log('Successfully generated image URL:', data.data[0].url)

    return new Response(
      JSON.stringify({ imageUrl: data.data[0].url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

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
