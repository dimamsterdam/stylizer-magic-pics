
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productInfo, theme, slideCount = 3 } = await req.json();
    
    if (!openAIApiKey) {
      console.error('OpenAI API key is not configured');
      throw new Error('OpenAI API key is not configured');
    }

    console.log(`Generating story content for ${slideCount} slides`);
    console.log('Product info:', productInfo);
    console.log('Theme:', theme);

    // Create a system prompt for generating story slides
    const systemPrompt = `You are a professional product photographer and creative director. 
    Your task is to create a cohesive story across ${slideCount} slides for a product spotlight. 
    Each slide should show the product in a different way that builds a narrative while highlighting different aspects.
    For each slide, create a photography prompt that a generative AI can use to create compelling product imagery.`;

    // Create the user prompt with product details
    const userPrompt = `Create a story with ${slideCount} slides for the following product:
    
    Product Name: ${productInfo.name}
    Product Description: ${productInfo.description || 'N/A'}
    Theme/Style: ${theme}
    
    For each slide, provide:
    1. A detailed photography prompt that describes the scene, lighting, camera angle, and focus
    2. A brief explanation of what aspect of the product this slide highlights
    
    Make each slide distinctly different while maintaining a cohesive story arc.
    Format your response as a JSON array with objects containing "prompt" and "focus" for each slide.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data.error);
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    let slides = [];
    
    try {
      const content = JSON.parse(data.choices[0].message.content);
      slides = content.slides || [];
      console.log('Generated slides:', slides);
    } catch (error) {
      console.error('Error parsing response:', error);
      console.error('Response content:', data.choices[0].message.content);
      throw new Error('Failed to parse story content from AI response');
    }

    // Generate single headline and subheadline
    const headlineResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Create a compelling headline and subheadline for a product spotlight.' 
          },
          { 
            role: 'user', 
            content: `Create a headline (max 8 words) and subheadline (max 20 words) for a product spotlight featuring ${productInfo.name} with the theme: ${theme}.
            Format your response as a JSON object with "headline" and "subheadline" keys.`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    const headlineData = await headlineResponse.json();
    let headline = "", subheadline = "";
    
    try {
      const content = JSON.parse(headlineData.choices[0].message.content);
      headline = content.headline || "";
      subheadline = content.subheadline || "";
    } catch (error) {
      console.error('Error parsing headline response:', error);
    }

    return new Response(JSON.stringify({ 
      slides, 
      headline, 
      subheadline 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-story-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
