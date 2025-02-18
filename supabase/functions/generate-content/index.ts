
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { type, products, theme, tone, promptContext } = await req.json();

    const { data: providerSetting, error: settingError } = await supabase
      .from('ai_provider_settings')
      .select('provider')
      .eq('feature_name', 'expose_text')
      .eq('feature_type', 'text_generation')
      .single();

    if (settingError) {
      throw new Error(`Failed to fetch AI provider setting: ${settingError.message}`);
    }

    if (providerSetting.provider !== 'openai') {
      throw new Error(`Unsupported AI provider for text generation: ${providerSetting.provider}`);
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    console.log('Generating content with tone:', tone);
    console.log('Prompt context:', promptContext);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a skilled marketing copywriter specializing in creating compelling product descriptions and headlines. You excel at writing in various tones, from formal to playful, while maintaining brand consistency.`
          },
          {
            role: 'user',
            content: promptContext
          }
        ],
        temperature: tone === 'formal' || tone === 'elegant' ? 0.5 : 0.7,
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
