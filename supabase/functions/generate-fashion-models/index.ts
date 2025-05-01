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
    const requestData = await req.json();
    console.log('Received request data:', requestData);
    
    // Handle both direct brandIdentity object and nested structure
    const brandIdentity = requestData.brandIdentity || requestData;
    const regenerate = requestData.regenerate || [];
    const count = requestData.count || 10;
    
    console.log('Using brand identity:', brandIdentity);

    if (!brandIdentity) {
      throw new Error('Brand identity is required');
    }

    // Create prompt based on brand identity
    const prompt = createModelGenerationPrompt(brandIdentity);
    console.log('Using prompt:', prompt);

    // Generate model descriptions using GPT-4o
    let modelDescriptions = await generateModelDescriptions(prompt, count);
    
    if (!modelDescriptions || modelDescriptions.length === 0) {
      console.log('Failed to generate descriptions, using fallback descriptions');
      modelDescriptions = generateFallbackDescriptions(count, brandIdentity);
    }
    
    console.log('Generated descriptions:', modelDescriptions);

    // Generate images for each model description
    const models = await Promise.all(modelDescriptions.map(async (desc, index) => {
      const modelId = crypto.randomUUID();

      // Skip regenerating already approved models
      if (regenerate.length > 0 && regenerate.some(model => model.id === modelId)) {
        return regenerate.find(model => model.id === modelId);
      }

      try {
        const imageUrl = await generateModelImage(desc);
        console.log(`Generated image for model ${index}:`, imageUrl ? "SUCCESS" : "FAILED");
        
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

    // Log the results for debugging
    console.log('Generated models:', JSON.stringify(models));

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
  const brandName = brandIdentity.brand_name || 'our brand';
  const genderPreference = brandIdentity.gender === 'all' 
    ? 'all genders' 
    : `primarily ${brandIdentity.gender}`;
  
  const ageRange = `${brandIdentity.age_range_min}-${brandIdentity.age_range_max}`;
  
  return `Create descriptions for fashion models that represent "${brandName}".
The target audience is ${genderPreference}, aged ${ageRange}, with ${brandIdentity.income_level} income level.
Brand values: ${brandIdentity.values.join(', ')}
Target audience characteristics: ${brandIdentity.characteristics.join(', ')}

Each description should be concise and focus on facial features appropriate for fashion photography.
Do not include any clothing descriptions or body type descriptions.
Focus only on facial characteristics, expression, and hair style that would appeal to the specified target audience.`;
}

function generateFallbackDescriptions(count: number, brandIdentity: BrandIdentity): string[] {
  // Generate fallback descriptions based on brand identity
  const descriptions = [];
  const genders = brandIdentity.gender === 'all' 
    ? ['male', 'female'] 
    : [brandIdentity.gender];
  
  const hairStyles = ['short', 'medium-length', 'long', 'wavy', 'straight', 'curly'];
  const hairColors = ['black', 'brown', 'blonde', 'red', 'dark'];
  const eyeColors = ['blue', 'green', 'brown', 'hazel'];
  const expressions = ['confident', 'thoughtful', 'friendly', 'mysterious', 'approachable'];
  const features = ['angular', 'defined', 'soft', 'distinctive', 'striking'];
  
  for (let i = 0; i < count; i++) {
    const gender = genders[i % genders.length];
    const hairStyle = hairStyles[Math.floor(Math.random() * hairStyles.length)];
    const hairColor = hairColors[Math.floor(Math.random() * hairColors.length)];
    const eyeColor = eyeColors[Math.floor(Math.random() * eyeColors.length)];
    const expression = expressions[Math.floor(Math.random() * expressions.length)];
    const feature = features[Math.floor(Math.random() * features.length)];
    
    descriptions.push(
      `A ${gender} model with ${hairStyle} ${hairColor} hair and ${eyeColor} eyes. Their ${feature} features and ${expression} expression embody the brand values.`
    );
  }
  
  return descriptions;
}

async function generateModelDescriptions(prompt: string, count: number): Promise<string[]> {
  try {
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return [];
    }
    
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

    if (data.error) {
      console.error('OpenAI API error:', data.error);
      return [];
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected API response format:', data);
      return [];
    }

    try {
      const content = data.choices[0].message.content;
      const parsed = JSON.parse(content);
      
      // Parse the response based on different possible formats
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (parsed.descriptions && Array.isArray(parsed.descriptions)) {
        return parsed.descriptions;
      } else if (parsed.model_descriptions && Array.isArray(parsed.model_descriptions)) {
        return parsed.model_descriptions;
      } else {
        // Try to find any array in the parsed object
        for (const key in parsed) {
          if (Array.isArray(parsed[key])) {
            return parsed[key];
          }
        }
      }
      
      // If we still have no descriptions, return empty array
      return [];
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
    }
    
    return [];
  } catch (error) {
    console.error('Error generating model descriptions:', error);
    return [];
  }
}

async function generateModelImage(description: string): Promise<string | null> {
  try {
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return null;
    }
    
    const prompt = `Generate a high-quality, professional headshot photo of a fashion model with these characteristics: ${description}. 
    The image should be a close-up portrait showing only the face and hair, with a clean, neutral background. 
    The lighting should be soft and flattering, typical of professional fashion photography. Ensure the image looks realistic and professional.`;

    console.log("Generating image with prompt:", prompt);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard"
      }),
    });

    const data = await response.json();
    console.log('Image generation response:', data);

    if (data.error) {
      console.error('OpenAI API error:', data.error);
      return null;
    }

    if (data.data && data.data[0] && data.data[0].url) {
      return data.data[0].url;
    }
    return null;
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}
