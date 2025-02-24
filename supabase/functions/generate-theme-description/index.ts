
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword, template, products } = await req.json();

    // Validate inputs
    if (!keyword || !template || !products) {
      console.error('Missing required parameters:', { keyword, template, products });
      throw new Error('Missing required parameters');
    }

    if (!Deno.env.get("OPENAI_API_KEY")) {
      console.error('OpenAI API key not found');
      throw new Error('OpenAI API key not configured');
    }

    const productDescriptions = products
      .map((p: { title: string; sku: string }) => p.title)
      .join(", ");

    console.log('Starting theme generation with:', {
      keyword,
      template,
      productDescriptions
    });

    const prompt = `
Generate a concise and practical theme description for a product photoshoot that:
1. Uses this base template: "${template}"
2. Features these products: ${productDescriptions}
3. Focuses on specific lighting and mood elements
4. Describes a practical photography setup

Maximum 2-3 sentences.`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional photographer and art director specializing in product photography. You create detailed, practical theme descriptions for photo shoots."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await openaiResponse.json();
    console.log('OpenAI API response:', data);

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI API response:', data);
      throw new Error('Invalid response from OpenAI API');
    }

    const themeDescription = data.choices[0].message.content.trim();
    console.log('Generated theme description:', themeDescription);

    return new Response(
      JSON.stringify({ themeDescription }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in generate-theme-description:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        stack: error.stack // Include stack trace in development
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
