
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword, template, products } = await req.json();

    const productDescriptions = products
      .map((p: { title: string; sku: string }) => p.title)
      .join(", ");

    const prompt = `
Given the theme keyword "${keyword}" and products: ${productDescriptions},
generate a detailed theme description that:
1. Expands on the base template: "${template}"
2. Incorporates specific lighting and mood elements
3. Ensures the setting complements the products
4. Maintains a practical photography setup
Maximum 2-3 sentences.
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional photographer and art director specializing in fashion product photography. You create detailed, practical theme descriptions for photo shoots."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const themeDescription = data.choices[0].message.content.trim();

    return new Response(
      JSON.stringify({ themeDescription }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
