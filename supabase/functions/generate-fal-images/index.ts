
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function makeDeepseekRequest(fullPrompt: string, deepseekKey: string, retryCount = 0): Promise<Response> {
  const url = 'https://api.deepseek.ai/v2/images/generation' // Note: using singular 'generation'
  console.log(`Attempt ${retryCount + 1}: Making request to ${url}`)

  const requestBody = {
    prompt: fullPrompt,
    n: 1,
    size: "1024x1024",
    response_format: "url",
    model: "deepseek-xl"
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    console.log(`Response status: ${response.status}`)
    const responseText = await response.text()
    console.log(`Response body: ${responseText}`)

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
    } catch (e) {
      console.error('Error parsing response:', e)
      throw new Error(`Invalid response format: ${responseText}`)
    }
  } catch (error) {
    if (retryCount < 2) {
      console.log(`Retrying request (attempt ${retryCount + 2})...`)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second before retry
      return makeDeepseekRequest(fullPrompt, deepseekKey, retryCount + 1)
    }
    throw error
  }
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
      console.error('DEEPSEEK_API_KEY not found')
      throw new Error('DEEPSEEK_API_KEY environment variable not set')
    }

    const fullPrompt = `${prompt}. ${angle} shot of the product.`
    console.log('Full prompt:', fullPrompt)

    return await makeDeepseekRequest(fullPrompt, deepseekKey)

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
