
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TestResult {
  step: string;
  success: boolean;
  details: any;
  error?: string;
}

async function testApiKey(): Promise<TestResult> {
  const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY')
  if (!deepseekKey) {
    return {
      step: 'API Key Validation',
      success: false,
      details: { exists: false },
      error: 'DEEPSEEK_API_KEY environment variable not set'
    }
  }

  // Remove 'Bearer ' prefix if it exists
  const cleanKey = deepseekKey.replace(/^Bearer\s+/i, '');
  
  return {
    step: 'API Key Validation',
    success: true,
    details: {
      exists: true,
      length: cleanKey.length,
      format: cleanKey.substring(0, 4) + '...',
      isValidFormat: cleanKey.startsWith('sk-')
    }
  }
}

async function testApiConnection(deepseekKey: string): Promise<TestResult> {
  try {
    // Remove 'Bearer ' prefix if it exists and add it back consistently
    const cleanKey = deepseekKey.replace(/^Bearer\s+/i, '');
    const authHeader = `Bearer ${cleanKey}`;
    
    console.log('Testing API connection...');

    const startTime = Date.now();

    // Using more specific request options
    const requestInit: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Supabase Edge Function'
      },
      body: JSON.stringify({
        prompt: 'test connection',
        n: 1,
        size: "256x256",
        response_format: "url",
        model: "deepseek/xl"
      }),
      // Adding specific request options
      keepalive: true,
      mode: 'cors',
      credentials: 'omit',
    };

    console.log('Request options:', {
      ...requestInit,
      headers: {
        ...requestInit.headers,
        'Authorization': 'Bearer sk-***' // Masking the actual key in logs
      }
    });

    // Create a URL object to ensure proper URL formatting
    const apiUrl = new URL('https://api.deepseek.ai/v1/images/generations');

    // Try with AbortController to handle timeouts
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(apiUrl.toString(), {
        ...requestInit,
        signal: controller.signal
      });

      clearTimeout(timeout);
      const responseTime = Date.now() - startTime;

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('Response text:', responseText);

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseText);
      } catch (e) {
        parsedResponse = responseText;
      }

      return {
        step: 'API Connection Test',
        success: response.ok,
        details: {
          statusCode: response.status,
          statusText: response.statusText,
          responseTime: `${responseTime}ms`,
          headers: Object.fromEntries(response.headers.entries()),
          response: parsedResponse
        },
        error: !response.ok ? `API returned status ${response.status}: ${responseText}` : undefined
      };
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        step: 'API Connection Test',
        success: false,
        details: {
          errorName: 'Timeout',
          errorMessage: 'Request timed out after 30 seconds',
          timestamp: new Date().toISOString()
        },
        error: 'Request timed out after 30 seconds'
      };
    }

    console.error('Connection test error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return {
      step: 'API Connection Test',
      success: false,
      details: { 
        errorName: error.name,
        errorMessage: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      },
      error: `Connection failed: ${error.message}`
    };
  }
}

async function runAllTests() {
  const results: TestResult[] = [];
  console.log('Starting Deepseek API tests...');

  // Test 1: API Key
  const apiKeyResult = await testApiKey();
  results.push(apiKeyResult);
  console.log('API Key test result:', apiKeyResult);

  if (apiKeyResult.success) {
    // Test 2: API Connection
    const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY')!;
    const connectionResult = await testApiConnection(deepseekKey);
    results.push(connectionResult);
    console.log('API Connection test result:', connectionResult);
  }

  return results;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const results = await runAllTests();
    const response = { 
      timestamp: new Date().toISOString(),
      results,
      allTestsPassed: results.every(r => r.success)
    };
    
    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in test-deepseek-connection:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Test execution failed',
        stack: error.stack,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});
