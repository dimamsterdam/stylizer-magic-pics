
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

    // Function to handle the API request with retries
    const makeRequest = async (retryCount = 0, maxRetries = 3) => {
      try {
        const url = 'https://queue.fal.run/fal-ai/flux-pro/finetuned'
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000)

        console.log(`Attempt ${retryCount + 1} of ${maxRetries + 1}`)

        const requestOptions = {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Key ${falKey}`,
            'User-Agent': 'Deno/1.0',
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

        const response = await fetch(url, requestOptions)
        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('FAL AI API error response:', errorText)
          throw new Error(`FAL AI API error: ${errorText}`)
        }

        const data = await response.json()
        console.log('FAL AI initial response:', data)

        if (!data.request_id) {
          throw new Error('No request_id received from FAL AI')
        }

        // Poll for the result
        let pollAttempts = 0
        const maxPollAttempts = 10
        let waitTime = 2000 // Start with 2 second wait

        while (pollAttempts < maxPollAttempts) {
          console.log(`Polling attempt ${pollAttempts + 1} with wait time ${waitTime}ms`)
          
          await new Promise(resolve => setTimeout(resolve, waitTime))
          
          const pollController = new AbortController()
          const pollTimeoutId = setTimeout(() => pollController.abort(), 10000)

          try {
            const pollResponse = await fetch(`https://queue.fal.run/fal-ai/flux-pro/finetuned/${data.request_id}`, {
              method: 'POST',
              headers: {
                'Authorization': `Key ${falKey}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              signal: pollController.signal
            })
            clearTimeout(pollTimeoutId)

            if (!pollResponse.ok) {
              const errorText = await pollResponse.text()
              console.error(`Polling error (attempt ${pollAttempts + 1}):`, errorText)
              
              if (pollResponse.status === 404) {
                throw new Error('Image generation request expired or not found')
              }
              
              pollAttempts++
              waitTime = Math.min(waitTime * 1.5, 10000)
              continue
            }

            const pollData = await pollResponse.json()
            console.log(`Poll attempt ${pollAttempts + 1} response:`, pollData)

            if (pollData.status === 'COMPLETED' && pollData.image) {
              return new Response(
                JSON.stringify({ imageUrl: pollData.image }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            if (pollData.status === 'FAILED') {
              throw new Error(`Image generation failed: ${pollData.error || 'Unknown error'}`)
            }

            pollAttempts++
            waitTime = Math.min(waitTime * 1.5, 10000)
          } catch (pollError) {
            clearTimeout(pollTimeoutId)
            if (pollError.name === 'AbortError') {
              console.error('Polling request timed out')
              pollAttempts++
              continue
            }
            throw pollError
          }
        }

        throw new Error('Polling timeout: Image generation took too long')
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out')
        }
        
        if (retryCount < maxRetries) {
          console.log(`Request failed, retrying (${retryCount + 1}/${maxRetries})...`)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
          return makeRequest(retryCount + 1, maxRetries)
        }
        
        throw error
      }
    }

    // Make the request with retries
    try {
      return await makeRequest()
    } catch (error) {
      console.error('All attempts failed:', error)
      throw error
    }

  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
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
