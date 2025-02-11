
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

async function testDNSAndConnectivity(): Promise<TestResult> {
  try {
    const startTime = Date.now();
    // Test basic connectivity to the API domain
    const response = await fetch('https://api.deepseek.ai/health', {
      method: 'HEAD'
    });
    const responseTime = Date.now() - startTime;

    return {
      step: 'DNS and Connectivity Test',
      success: response.ok || response.status === 404, // 404 is ok as the health endpoint might not exist
      details: {
        dnsResolved: true,
        connectionEstablished: true,
        responseTime: `${responseTime}ms`,
        status: response.status
      }
    };
  } catch (error) {
    console.error('DNS/Connectivity test error:', error);
    return {
      step: 'DNS and Connectivity Test',
      success: false,
      details: {
        dnsResolved: false,
        error: error.message
      },
      error: `Connection failed: ${error.message}`
    };
  }
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
    
    console.log('Testing API connection with headers:', {
      'Content-Type': 'application/json',
      'Authorization': authHeader.substring(0, 15) + '...' // Log partial header for debugging
    });

    const startTime = Date.now();
    
    // First, try a simpler request to verify authentication
    const authTestResponse = await fetch('https://api.deepseek.ai/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      }
    });

    if (!authTestResponse.ok) {
      const authErrorText = await authTestResponse.text();
      return {
        step: 'API Connection Test',
        success: false,
        details: {
          statusCode: authTestResponse.status,
          statusText: authTestResponse.statusText,
          response: authErrorText
        },
        error: `Authentication failed: ${authTestResponse.status} - ${authErrorText}`
      };
    }

    // If authentication works, try the image generation endpoint
    const response = await fetch('https://api.deepseek.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'test connection',
        n: 1,
        size: "256x256",
        response_format: "url",
        model: "deepseek/xl"
      })
    });

    const responseTime = Date.now() - startTime;
    const responseText = await response.text();
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
    }
  } catch (error) {
    console.error('Connection test error:', error);
    return {
      step: 'API Connection Test',
      success: false,
      details: { 
        error: error.message,
        stack: error.stack
      },
      error: `Connection failed: ${error.message}`
    }
  }
}

async function runAllTests() {
  const results: TestResult[] = [];
  console.log('Starting Deepseek API tests...');

  // Test 1: DNS and Connectivity
  const connectivityResult = await testDNSAndConnectivity();
  results.push(connectivityResult);
  console.log('DNS and Connectivity test result:', connectivityResult);

  if (connectivityResult.success) {
    // Test 2: API Key
    const apiKeyResult = await testApiKey();
    results.push(apiKeyResult);
    console.log('API Key test result:', apiKeyResult);

    if (apiKeyResult.success) {
      // Test 3: API Connection
      const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY')!;
      const connectionResult = await testApiConnection(deepseekKey);
      results.push(connectionResult);
      console.log('API Connection test result:', connectionResult);
    }
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
        stack: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});
