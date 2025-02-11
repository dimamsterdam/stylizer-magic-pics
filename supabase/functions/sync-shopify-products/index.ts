
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

serve(async (req: Request) => {
  try {
    // Add CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Parse search parameters from request
    const { searchTerm } = await req.json().catch(() => ({}));
    console.log('Searching Shopify products with term:', searchTerm);

    // Fetch products from Shopify
    const shopifyUrl = 'https://quickstart-50d94e13.myshopify.com/api/2024-01/graphql.json';
    console.log('Using Shopify URL:', shopifyUrl);
    
    const shopifyToken = Deno.env.get('SHOPIFY_STOREFRONT_API_KEY');
    if (!shopifyToken) {
      console.error('Missing Shopify Storefront API Key');
      throw new Error('Missing Shopify Storefront API Key');
    }

    const query = buildShopifyQuery(searchTerm);
    console.log('Executing Shopify query:', query);

    const response = await fetch(shopifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': shopifyToken,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      console.error('Shopify API error:', response.status, await response.text());
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Shopify API response:', JSON.stringify(data, null, 2));
    
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

    console.log(`Found ${products.length} products`);

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
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }), 
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    );
  }
});
