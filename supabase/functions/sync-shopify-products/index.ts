
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const shopifyQuery = `
query {
  products(first: 50) {
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

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch products from Shopify
    const response = await fetch('https://your-store.myshopify.com/api/2024-01/graphql.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': Deno.env.get('SHOPIFY_STOREFRONT_API_KEY') ?? '',
      },
      body: JSON.stringify({ query: shopifyQuery }),
    });

    const data = await response.json();
    
    if (!data.data?.products?.edges) {
      throw new Error('Invalid response from Shopify');
    }

    // Transform and upsert products
    const products = data.data.products.edges.map((edge: any) => ({
      id: edge.node.id.split('/').pop(),
      shopify_gid: edge.node.id,
      title: edge.node.title,
      description: edge.node.description,
      sku: edge.node.variants.edges[0]?.node.sku || null,
      price: edge.node.variants.edges[0]?.node.price.amount || null,
      image_url: edge.node.images.edges[0]?.node.url || null,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabaseClient
      .from('products')
      .upsert(products, { onConflict: 'shopify_gid' });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, count: products.length }),
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
      JSON.stringify({ error: error.message }), 
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
