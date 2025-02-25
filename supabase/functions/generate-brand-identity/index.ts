
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrandIdentityResponse {
  values: string[];
  age_range_min: number;
  age_range_max: number;
  gender: 'all' | 'male' | 'female' | 'non_binary';
  income_level: 'low' | 'medium' | 'high' | 'luxury';
  characteristics: string[];
  photography_mood: string;
  photography_lighting: string;
}

function validateResponse(data: any): data is BrandIdentityResponse {
  const requiredFields = [
    'values',
    'age_range_min',
    'age_range_max',
    'gender',
    'income_level',
    'characteristics',
    'photography_mood',
    'photography_lighting'
  ];

  const isValid = requiredFields.every(field => field in data) &&
    Array.isArray(data.values) &&
    Array.isArray(data.characteristics) &&
    typeof data.age_range_min === 'number' &&
    typeof data.age_range_max === 'number' &&
    ['all', 'male', 'female', 'non_binary'].includes(data.gender) &&
    ['low', 'medium', 'high', 'luxury'].includes(data.income_level) &&
    typeof data.photography_mood === 'string' &&
    typeof data.photography_lighting === 'string';

  return isValid;
}

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
            content: `You are a brand identity expert. Generate brand identity details based on the brand name. You must return a JSON object with exactly these fields:
            - values: array of 3-5 strings representing brand values
            - age_range_min: number representing minimum target age
            - age_range_max: number representing maximum target age
            - gender: one of ["all", "male", "female", "non_binary"]
            - income_level: one of ["low", "medium", "high", "luxury"]
            - characteristics: array of 3-5 strings describing target audience traits
            - photography_mood: string describing the mood and style of brand photography
            - photography_lighting: string describing preferred lighting style
            
            Return only valid JSON without any explanations.`
          },
          {
            role: 'user',
            content: `Generate a comprehensive brand identity for "${brandName}". Consider the name's implications for target demographics and brand positioning.`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    console.log('OpenAI response:', data);

    const parsedIdentity = JSON.parse(data.choices[0].message.content);
    console.log('Parsed identity:', parsedIdentity);

    if (!validateResponse(parsedIdentity)) {
      throw new Error('Invalid response format from AI');
    }

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
