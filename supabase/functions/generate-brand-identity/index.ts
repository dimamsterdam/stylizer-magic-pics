
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brandName } = await req.json();

    if (!brandName) {
      throw new Error('Brand name is required');
    }

    console.log('Generating brand identity for:', brandName);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are a brand identity expert. Generate brand identity details based on the brand name. Return only JSON without any explanations.'
          },
          {
            role: 'user',
            content: `Generate a comprehensive brand identity for "${brandName}". Include: values (array of 3-5 key values), target age range (min and max), target gender (all/male/female/non_binary), income level (low/medium/high/luxury), characteristics (array of 3-5 target audience traits), photography mood description, and photography lighting preferences. Format as JSON.`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    const parsedIdentity = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(parsedIdentity), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating brand identity:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
