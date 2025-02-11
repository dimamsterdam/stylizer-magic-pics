
// @ts-ignore
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  try {
    console.log("Function invoked with method:", req.method);
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Get Shopify token
    const shopifyToken = Deno.env.get('SHOPIFY_STOREFRONT_API_KEY');
    console.log("Checking Shopify token:", shopifyToken ? "Token exists" : "Token missing");
    
    if (!shopifyToken) {
      throw new Error('Missing Shopify API key');
    }

    // Parse request body
    const requestData = await req.json();
    console.log("Request data:", JSON.stringify(requestData));
    const { searchTerm } = requestData;

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

    console.log("Sending request to Shopify");
    const response = await fetch(
      'https://quickstart-50d94e13.myshopify.com/api/2024-01/graphql.json',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': shopifyToken,
        },
        body: JSON.stringify({ query }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Shopify API error:", errorText);
      throw new Error(`Shopify API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("Shopify response received");

    if (!data.data) {
      console.error("Invalid Shopify response:", data);
      throw new Error('Invalid response from Shopify');
    }

    const products = data.data.products.edges.map((edge: any) => ({
      id: edge.node.id.split('/').pop(),
      shopify_gid: edge.node.id,
      title: edge.node.title,
      description: edge.node.description,
      sku: edge.node.variants.edges[0]?.node.sku || null,
      price: edge.node.variants.edges[0]?.node.price.amount || null,
      image_url: edge.node.images.edges[0]?.node.url || null,
    }));

    console.log(`Returning ${products.length} products`);
    return new Response(
      JSON.stringify({ success: true, products }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-shopify-products:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
