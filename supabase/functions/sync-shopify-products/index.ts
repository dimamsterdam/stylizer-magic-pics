
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const buildShopifyQuery = (searchTerm?: string) => `
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
}`;

console.log("Edge Function starting...");

serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders
    });
  }

  try {
    console.log('Request received:', req.method);

    // Parse search parameters from request
    const { searchTerm } = await req.json().catch(() => {
      console.log('No request body or invalid JSON');
      return {};
    });
    
    console.log('Search term:', searchTerm);

    // Check for Shopify API key
    const shopifyToken = Deno.env.get('SHOPIFY_STOREFRONT_API_KEY');
    if (!shopifyToken) {
      console.error('Missing Shopify Storefront API Key');
      throw new Error('Configuration error: Missing Shopify API key');
    }

    // Fetch products from Shopify
    const shopifyUrl = 'https://quickstart-50d94e13.myshopify.com/api/2024-01/graphql.json';
    const query = buildShopifyQuery(searchTerm);
    
    console.log('Sending request to Shopify...');
    const response = await fetch(shopifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': shopifyToken,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shopify API error:', response.status, errorText);
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data?.products?.edges) {
      console.error('Invalid response from Shopify:', data);
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
      JSON.stringify({ 
        success: true, 
        products 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error('Error in Edge Function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }), 
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        } 
      }
    );
  }
});
