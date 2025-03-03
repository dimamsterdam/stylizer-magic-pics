
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductImage {
  url: string;
}

interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  variants: {
    edges: Array<{
      node: {
        sku: string;
        price: {
          amount: string;
        };
      };
    }>;
  };
  description: string;
  featuredImage: {
    url: string;
  };
  images: {
    edges: Array<{
      node: ProductImage;
    }>;
  };
}

async function searchShopifyProducts(searchTerm: string) {
  try {
    const SHOPIFY_STORE_URL = "your-store.myshopify.com";
    const SHOPIFY_API_KEY = Deno.env.get("SHOPIFY_STOREFRONT_API_KEY") || "";
    
    if (!SHOPIFY_API_KEY) {
      throw new Error("Missing Shopify API key");
    }

    // Mock implementation for demo purposes
    console.log(`Searching for products with term: ${searchTerm}`);
    
    // Simulate fetching from Shopify API
    const products = [
      {
        id: "product1",
        title: `Sample Product: ${searchTerm}`,
        sku: "SKU-1234",
        description: "This is a sample product description",
        price: "49.99",
        image_url: "/placeholder.svg",
        shopify_gid: "gid://shopify/Product/1234567890",
        images: ["/placeholder.svg", "/placeholder.svg"]
      },
      {
        id: "product2",
        title: `Another Product: ${searchTerm}`,
        sku: "SKU-5678",
        description: "Another sample product description",
        price: "29.99",
        image_url: "/placeholder.svg",
        shopify_gid: "gid://shopify/Product/9876543210",
        images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
      }
    ];
    
    return { products };
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === 'POST') {
      const { searchTerm } = await req.json();
      
      if (!searchTerm || typeof searchTerm !== 'string') {
        return new Response(
          JSON.stringify({ error: "Search term is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = await searchShopifyProducts(searchTerm);
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
