
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ToneStyle = 'formal' | 'elegant' | 'informal' | 'playful' | 'edgy';

interface ToneConfig {
  systemPrompt: string;
  temperature: number;
  topP: number;
}

const toneConfigurations: Record<ToneStyle, ToneConfig> = {
  formal: {
    systemPrompt: "You are a professional copywriter specializing in formal, authoritative marketing content. Use sophisticated vocabulary, maintain a professional distance, and focus on facts and specifications. Avoid colloquialisms and informal language.",
    temperature: 0.5,
    topP: 0.7
  },
  elegant: {
    systemPrompt: "You are a luxury brand copywriter who creates refined, poetic content. Use graceful language, artistic expressions, and evocative imagery. Focus on aesthetics and emotional resonance while maintaining sophistication.",
    temperature: 0.6,
    topP: 0.8
  },
  informal: {
    systemPrompt: "You are a conversational copywriter who creates friendly, approachable content. Write as if speaking to a friend, use natural language, and maintain a warm, welcoming tone. Keep it professional but personable.",
    temperature: 0.7,
    topP: 0.9
  },
  playful: {
    systemPrompt: "You are an energetic copywriter who creates fun, engaging content. Use witty wordplay, inject humor, and maintain an upbeat, enthusiastic tone. Be creative and entertaining while still being professional.",
    temperature: 0.8,
    topP: 0.9
  },
  edgy: {
    systemPrompt: "You are a bold, innovative copywriter who creates provocative, boundary-pushing content. Use strong, impactful language, challenge conventions, and maintain a confident, assertive tone. Be daring while staying tasteful.",
    temperature: 0.9,
    topP: 1.0
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, products, theme, tone, promptContext } = await req.json();
    
    if (!openAIApiKey) {
      console.error('OpenAI API key is not configured');
      throw new Error('OpenAI API key is not configured');
    }

    console.log('Generating content with tone:', tone);
    const toneConfig = toneConfigurations[tone as ToneStyle];
    console.log('Using tone configuration:', {
      temperature: toneConfig.temperature,
      topP: toneConfig.topP
    });

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
            content: toneConfig.systemPrompt
          },
          {
            role: 'user',
            content: promptContext
          }
        ],
        temperature: toneConfig.temperature,
        top_p: toneConfig.topP,
        max_tokens: type === 'headline' ? 50 : 200,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data.error);
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    console.log('Generated content successfully');
    const generatedText = data.choices[0].message.content;

    return new Response(JSON.stringify({ generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
