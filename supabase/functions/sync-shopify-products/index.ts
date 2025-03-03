
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0'
import { corsHeaders } from '../_shared/cors.ts'

interface ShopifyProductImage {
  id: string;
  url: string;
}

interface ShopifyProduct {
  id: string;
  title: string;
  sku?: string;
  variants?: { sku: string }[];
  priceRange?: { minVariantPrice: { amount: string } };
  images: { edges: { node: ShopifyProductImage }[] }[];
}

// This gets called from Videographer.tsx when searching for products
Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const SHOPIFY_STOREFRONT_API_KEY = Deno.env.get('SHOPIFY_STOREFRONT_API_KEY') || ''
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    const { searchTerm } = await req.json()
    
    // Query Shopify for products matching search term
    const query = `
      query ($query: String!) {
        products(first: 10, query: $query) {
          edges {
            node {
              id
              title
              sku: metafield(namespace: "custom", key: "sku") {
                value
              }
              variants(first: 1) {
                edges {
                  node {
                    sku
                  }
                }
              }
              priceRange {
                minVariantPrice {
                  amount
                }
              }
              images(first: 10) {
                edges {
                  node {
                    id
                    url
                  }
                }
              }
            }
          }
        }
      }
    `
    
    const response = await fetch('https://your-store.myshopify.com/api/2023-01/graphql.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_API_KEY,
      },
      body: JSON.stringify({
        query,
        variables: { query: searchTerm },
      }),
    })
    
    const data = await response.json()
    
    // For mock or development purposes, if no Shopify API is set up
    // We'll return fake products based on the search term
    // In production, comment this out and use the Shopify API response
    const mockProducts = [
      { 
        id: '1', 
        title: `Cream Sweater ${searchTerm}`, 
        sku: 'SW-001',
        image_url: '/placeholder.svg',
        images: [
          '/placeholder.svg',
          '/lovable-uploads/af88ce94-30e1-4875-b411-1c07060016c2.png',
          '/lovable-uploads/61d9b435-6552-49b0-a269-25c905ba18c9.png'
        ]
      },
      { 
        id: '2', 
        title: `Black T-Shirt ${searchTerm}`, 
        sku: 'TS-001',
        image_url: '/placeholder.svg',
        images: [
          '/placeholder.svg',
          '/lovable-uploads/047c9307-af3c-47c6-b2e6-ea9d51a0c8cc.png',
          '/lovable-uploads/0f0a212c-5edc-4c90-a258-6b43222bac06.png'
        ]
      },
      { 
        id: '3', 
        title: `Button Up Shirt ${searchTerm}`, 
        sku: 'BS-001',
        image_url: '/placeholder.svg',
        images: [
          '/placeholder.svg',
          '/lovable-uploads/85ad1b88-47a8-4226-bc2e-63fa2dcf049a.png',
          '/lovable-uploads/9bac9fd0-2115-4bae-8108-0b973f83db37.png'
        ]
      }
    ]
    
    // Process Shopify products or use mock data
    let products = []
    
    // In development/mock mode
    if (!SHOPIFY_STOREFRONT_API_KEY || SHOPIFY_STOREFRONT_API_KEY === 'mock') {
      products = mockProducts.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    } 
    // Using actual Shopify data
    else if (data?.data?.products?.edges) {
      products = data.data.products.edges.map((edge: any) => {
        const product = edge.node
        const sku = product.sku?.value || (product.variants?.edges[0]?.node.sku || '')
        const price = product.priceRange?.minVariantPrice.amount || null
        
        // Extract all image URLs
        const images = product.images.edges.map((imgEdge: any) => imgEdge.node.url)
        
        return {
          id: product.id,
          shopify_gid: product.id,
          title: product.title,
          sku,
          price,
          image_url: images[0] || '/placeholder.svg', // Primary image
          images: images // All images
        }
      })
    }
    
    // Upsert products into database (optional)
    if (products.length > 0) {
      const { error } = await supabase
        .from('products')
        .upsert(products, {
          onConflict: 'id'
        })
        
      if (error) throw error
    }
    
    // Return products to client
    return new Response(
      JSON.stringify({ products }),
      { 
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
    
  } catch (error) {
    console.error('Error:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  }
})
