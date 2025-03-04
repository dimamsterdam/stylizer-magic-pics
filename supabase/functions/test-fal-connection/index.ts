
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
    const falKey = Deno.env.get('FAL_KEY')
    if (!falKey) {
      throw new Error('FAL_KEY environment variable not set')
    }
    
    // Log the first few characters of the API key to verify format (safely)
    console.log('API Key format check:', {
      length: falKey.length,
      firstChars: falKey.substring(0, 4) + '...'
    })

    const testPrompt = "A simple product photography test"
    console.log('Test prompt:', testPrompt)

    const response = await fetch('https://queue.fal.run/fal-ai/flux-pro/finetuned', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        seed: 1234567,
        prompt: testPrompt,
        image_size: "square_1_1",
        num_images: 1,
        finetune_id: "ca8516ba-1e40-4f58-bf59-83b2d6c5f1d0",
        output_format: "jpeg",
        guidance_scale: 3.5,
        finetune_strength: 1.3,
        num_inference_steps: 30
      })
    })

    console.log('FAL API response status:', response.status)
    
    const responseText = await response.text()
    console.log('FAL API response body (truncated):', responseText.substring(0, 200) + '...')

    if (!response.ok) {
      throw new Error(`FAL API error (${response.status}): ${responseText}`)
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Error parsing response:', parseError)
      throw new Error(`Invalid JSON response from FAL: ${responseText}`)
    }

    if (!data.images?.[0]?.url) {
      console.error('Unexpected response structure:', data)
      throw new Error('No image URL in FAL response')
    }

    console.log('Successfully generated test image URL:', data.images[0].url)

    return new Response(
      JSON.stringify({ success: true, imageUrl: data.images[0].url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in test-fal-connection:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    })

    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'An error occurred while testing the FAL API connection. Please check your API key and try again.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
