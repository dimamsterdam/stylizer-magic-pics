
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
      const url = 'https://queue.fal.run/fal-ai/flux-pro/finetuned'

      // Call FAL AI API with more detailed error handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // Increased timeout to 60s

      const requestOptions = {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Key ${falKey}`,
          'User-Agent': 'Deno/1.0',
          'Connection': 'keep-alive'
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          image_size: "landscape_4_3",
          num_images: 1,
          seed: Math.floor(Math.random() * 2000000),
          finetune_id: "ca8516ba-1e40-4f58-bf59-83b2d6c5f1d0",
          output_format: "jpeg",
          guidance_scale: 3.5,
          finetune_strength: 1.3,
          num_inference_steps: 44
        }),
        signal: controller.signal
      }

      console.log('Request options:', {
        url,
        method: requestOptions.method,
        headers: { ...requestOptions.headers, Authorization: '[REDACTED]' },
        body: requestOptions.body
      })

      const response = await fetch(url, requestOptions)

      console.log('FAL AI response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('FAL AI API error response:', errorText)
        throw new Error(`FAL AI API error: ${errorText}`)
      }

      const data = await response.json()
      console.log('FAL AI initial response:', data)

      // Get the request_id from the response
      const requestId = data.request_id
      if (!requestId) {
        throw new Error('No request_id received from FAL AI')
      }

      // Poll for the result with exponential backoff
      const maxAttempts = 15 // Reduced max attempts but with longer intervals
      let attempts = 0
      let waitTime = 2000 // Start with 2 second wait

      while (attempts < maxAttempts) {
        console.log(`Polling attempt ${attempts + 1} with wait time ${waitTime}ms`)
        
        // Wait before polling
        await new Promise(resolve => setTimeout(resolve, waitTime))
        
        const pollResponse = await fetch(`https://queue.fal.run/fal-ai/flux-pro/finetuned/${requestId}`, {
          method: 'POST', // Changed to POST method
          headers: {
            'Authorization': `Key ${falKey}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        })

        if (!pollResponse.ok) {
          const errorText = await pollResponse.text()
          console.error(`Polling error (attempt ${attempts + 1}):`, errorText)
          
          // If we get a 404, the request might have expired
          if (pollResponse.status === 404) {
            throw new Error('Image generation request expired or not found')
          }
          
          attempts++
          waitTime = Math.min(waitTime * 1.5, 10000) // Exponential backoff, max 10s
          continue
        }

        const pollData = await pollResponse.json()
        console.log(`Poll attempt ${attempts + 1} response:`, pollData)

        if (pollData.status === 'COMPLETED' && pollData.image) {
          clearTimeout(timeoutId) // Clear the timeout since we're done
          return new Response(
            JSON.stringify({ 
              imageUrl: pollData.image,
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        if (pollData.status === 'FAILED') {
          clearTimeout(timeoutId)
          throw new Error(`Image generation failed: ${pollData.error || 'Unknown error'}`)
        }

        attempts++
        waitTime = Math.min(waitTime * 1.5, 10000) // Exponential backoff, max 10s
      }

      clearTimeout(timeoutId)
      throw new Error('Timeout waiting for image generation. Please try again.')
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timed out after 60 seconds')
      }
      console.error('Fetch error details:', {
        name: fetchError.name,
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
