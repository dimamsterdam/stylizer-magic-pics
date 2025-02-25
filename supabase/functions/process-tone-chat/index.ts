
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
    const { message, currentHeadline, currentBodyCopy, chatHistory } = await req.json();

    // Format the chat history and current request for the AI
    const messages = [
      {
        role: "system",
        content: "You are a helpful assistant that specializes in adjusting the tone and style of marketing text for fashion products. You should interpret user requests and provide updated versions of the text that match their desired tone while maintaining the core message."
      },
      ...chatHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: "user",
        content: `Please adjust the following text based on this request: "${message}"\n\nCurrent headline: "${currentHeadline}"\nCurrent body copy: "${currentBodyCopy}"`
      }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse the AI response to extract the new headline and body copy
    const headlineMatch = aiResponse.match(/Headline:(.*?)(?=Body|$)/s);
    const bodyMatch = aiResponse.match(/Body:(.*?)$/s);

    const updatedHeadline = headlineMatch ? headlineMatch[1].trim() : currentHeadline;
    const updatedBodyCopy = bodyMatch ? bodyMatch[1].trim() : currentBodyCopy;

    return new Response(
      JSON.stringify({
        message: aiResponse,
        updatedHeadline,
        updatedBodyCopy,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
