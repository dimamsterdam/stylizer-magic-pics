
// @ts-ignore
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  // Validate request method
  if (req.method !== 'POST') {
    console.error("Invalid method:", req.method);
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Get and validate Shopify token
    const shopifyToken = Deno.env.get('SHOPIFY_STOREFRONT_API_KEY');
    console.log("Checking Shopify token:", shopifyToken ? "Token exists" : "Token missing");
    
    if (!shopifyToken) {
      console.error("Missing Shopify API key in environment variables");
      return new Response(
        JSON.stringify({ error: 'Missing Shopify API key configuration' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body with error handling
    let requestData;
    try {
      requestData = await req.json();
      console.log("Parsed request data:", JSON.stringify(requestData));
    } catch (error) {
      console.error("Error parsing request body:", error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request body',
          details: error.message 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { searchTerm } = requestData;

    // Construct GraphQL query
    const query = `
      query {
        products(first: 50${searchTerm ? `, query: "${searchTerm}"` : ''}) {
          edges {
            node {
              id
              title
              description
              variants(first: 1) {
                edges {
                  node {
                    sku
                    price {
                      amount
                    }
                  }
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url
                  }
                }
              }
            }
          }
        }
      }
    `;

    console.log("Sending request to Shopify API");
    const shopifyUrl = 'https://quickstart-50d94e13.myshopify.com/api/2024-01/graphql.json';
    console.log("Shopify URL:", shopifyUrl);
    console.log("Query:", query);
    
    const shopifyResponse = await fetch(shopifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': shopifyToken,
      },
      body: JSON.stringify({ query }),
    });

    // Log the raw response for debugging
    console.log("Shopify response status:", shopifyResponse.status);
    const responseText = await shopifyResponse.text();
    console.log("Shopify raw response:", responseText);

    // Handle non-OK responses
    if (!shopifyResponse.ok) {
      console.error("Shopify API error:", {
        status: shopifyResponse.status,
        statusText: shopifyResponse.statusText,
        body: responseText
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Shopify API error',
          details: `${shopifyResponse.status}: ${responseText}`
        }),
        { 
          status: shopifyResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse the response JSON after confirming it's valid
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error("Error parsing Shopify response:", error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON response from Shopify',
          details: error.message
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate Shopify response structure
    if (!data.data?.products?.edges) {
      console.error("Invalid Shopify response structure:", data);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response from Shopify',
          details: 'Response missing required data structure',
          response: data
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Transform products data
    const products = data.data.products.edges.map((edge: any) => ({
      id: edge.node.id.split('/').pop(),
      shopify_gid: edge.node.id,
      title: edge.node.title,
      description: edge.node.description,
      sku: edge.node.variants.edges[0]?.node.sku || null,
      price: edge.node.variants.edges[0]?.node.price.amount || null,
      image_url: edge.node.images.edges[0]?.node.url || null,
    }));

    console.log(`Successfully processed ${products.length} products`);
    return new Response(
      JSON.stringify({ success: true, products }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Unhandled error in sync-shopify-products:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        stack: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
