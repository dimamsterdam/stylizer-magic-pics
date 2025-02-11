
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

async function testNetworkConnectivity(): Promise<TestResult> {
  try {
    console.log('Testing general network connectivity...');
    const response = await fetch('https://api.github.com/zen');
    const text = await response.text();
    
    return {
      step: 'Network Connectivity Test',
      success: true,
      details: {
        status: response.status,
        response: text.substring(0, 50) // Only log first 50 chars
      }
    };
  } catch (error) {
    console.error('Network connectivity test failed:', error);
    return {
      step: 'Network Connectivity Test',
      success: false,
      details: {
        errorName: error.name,
        errorMessage: error.message
      },
      error: 'Failed to connect to test endpoint'
    };
  }
}

async function testApiConnection(deepseekKey: string): Promise<TestResult> {
  try {
    // Remove 'Bearer ' prefix if it exists and add it back consistently
    const cleanKey = deepseekKey.replace(/^Bearer\s+/i, '');
    const authHeader = `Bearer ${cleanKey}`;
    
    console.log('Testing Deepseek API connection...');

    // Test with minimal request
    const response = await fetch('https://api.deepseek.ai/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': authHeader
      }
    });

    const responseText = await response.text();
    console.log('Models endpoint response:', {
      status: response.status,
      text: responseText
    });

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
        headers: Object.fromEntries(response.headers.entries()),
        response: parsedResponse
      },
      error: !response.ok ? `API returned status ${response.status}: ${responseText}` : undefined
    };
  } catch (error) {
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
  console.log('Starting connection tests...');

  // Test 1: Network Connectivity
  const networkResult = await testNetworkConnectivity();
  results.push(networkResult);
  console.log('Network test result:', networkResult);

  if (!networkResult.success) {
    return results;
  }

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
