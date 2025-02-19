
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
    if (!shopifyToken) {
      console.error("Missing Shopify API key");
      return new Response(
        JSON.stringify({ error: 'Missing Shopify API key configuration' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const { searchTerm } = await req.json();
    console.log("Search term:", searchTerm);

    // Construct GraphQL query
    const query = `
      query {
        products(first: 10${searchTerm ? `, query: "${searchTerm}"` : ''}) {
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
    const shopifyResponse = await fetch('https://quickstart-50d94e13.myshopify.com/api/2024-01/graphql.json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${shopifyToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!shopifyResponse.ok) {
      const errorText = await shopifyResponse.text();
      console.error("Shopify API error:", {
        status: shopifyResponse.status,
        body: errorText
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Shopify API error',
          details: errorText
        }),
        { 
          status: shopifyResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await shopifyResponse.json();
    
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
    console.error('Error in sync-shopify-products:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
