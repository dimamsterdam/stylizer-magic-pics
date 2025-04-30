
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ModelDescription {
  id: string;
  description: string;
  imageUrl: string | null;
  approved: boolean;
  [key: string]: string | boolean | null;
}

interface BrandIdentity {
  brand_name?: string;
  values: string[];
  age_range_min: number;
  age_range_max: number;
  gender: 'all' | 'male' | 'female' | 'non_binary';
  income_level: 'low' | 'medium' | 'high' | 'luxury';
  characteristics: string[];
  photography_mood?: string;
  photography_lighting?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brandIdentity, regenerate = [], count = 10 } = await req.json();
    console.log('Generating fashion models for brand:', brandIdentity.brand_name);

    if (!brandIdentity) {
      throw new Error('Brand identity is required');
    }

    // Create prompt based on brand identity
    const prompt = createModelGenerationPrompt(brandIdentity);
    console.log('Using prompt:', prompt);

    // Generate model descriptions using GPT-4o
    const modelDescriptions = await generateModelDescriptions(prompt, count);
    console.log('Generated descriptions:', modelDescriptions);

    // Generate images for each model description
    const models = await Promise.all(modelDescriptions.map(async (desc, index) => {
      const modelId = crypto.randomUUID();

      // Skip regenerating already approved models
      if (regenerate.includes(modelId)) {
        return regenerate.find(model => model.id === modelId);
      }

      try {
        const imageUrl = await generateModelImage(desc);
        
        return {
          id: modelId,
          description: desc,
          imageUrl,
          approved: false
        } as ModelDescription;
      } catch (error) {
        console.error(`Error generating image for model ${index}:`, error);
        return {
          id: modelId,
          description: desc,
          imageUrl: null,
          approved: false
        } as ModelDescription;
      }
    }));

    return new Response(JSON.stringify(models), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-fashion-models:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function createModelGenerationPrompt(brandIdentity: BrandIdentity): string {
  const genderPreference = brandIdentity.gender === 'all' 
    ? 'all genders' 
    : `primarily ${brandIdentity.gender}`;
  
  const ageRange = `${brandIdentity.age_range_min}-${brandIdentity.age_range_max}`;
  
  return `Create descriptions for fashion models that represent "${brandIdentity.brand_name || 'our brand'}".
The target audience is ${genderPreference}, aged ${ageRange}, with ${brandIdentity.income_level} income level.
Brand values: ${brandIdentity.values.join(', ')}
Target audience characteristics: ${brandIdentity.characteristics.join(', ')}

Each description should be concise and focus on facial features appropriate for fashion photography.
Do not include any clothing descriptions or body type descriptions.
Focus only on facial characteristics, expression, and hair style that would appeal to the specified target audience.`;
}

async function generateModelDescriptions(prompt: string, count: number): Promise<string[]> {
  try {
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
            content: `You are a fashion industry expert who creates model descriptions. Generate ${count} different, 
            diverse model descriptions based on the criteria provided. Each description should be 1-3 sentences maximum 
            focusing only on facial characteristics, expression, and hair style.
            Respond with a JSON array of strings, each string being one model description.
            Example format: ["Description 1", "Description 2", ...]`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    console.log('OpenAI response for descriptions:', data);

    const parsedContent = JSON.parse(data.choices[0].message.content);
    return Array.isArray(parsedContent) ? parsedContent : parsedContent.descriptions || [];
  } catch (error) {
    console.error('Error generating model descriptions:', error);
    return Array(count).fill('Error generating description');
  }
}

async function generateModelImage(description: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o",
        prompt: `Generate a high-quality, professional headshot photo of a fashion model with these characteristics: ${description}. 
        The image should be a close-up portrait showing only the face and hair, with a clean, neutral background. 
        The lighting should be soft and flattering, typical of professional fashion photography. Ensure the image looks realistic and professional.`,
        n: 1,
        size: "1024x1024",
        quality: "hd"
      }),
    });

    const data = await response.json();
    console.log('Image generation response:', data);

    if (data.data && data.data[0] && data.data[0].url) {
      return data.data[0].url;
    }
    return null;
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}
