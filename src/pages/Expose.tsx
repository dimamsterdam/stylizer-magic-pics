
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductPicker } from "@/components/ProductPicker";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Product {
  id: string;
  title: string;
  sku: string;
  image: string;
}

const Expose = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const { toast } = useToast();
  
  const { data: searchResults = [], isLoading, error } = useQuery({
    queryKey: ['products', searchTerm],
    queryFn: async () => {
      if (searchTerm.length < 2) return [];
      const { data, error } = await supabase
        .from('products')
        .select('id, title, sku, image_url')
        .ilike('title', `%${searchTerm}%`)
        .limit(10);

      if (error) throw error;

      return data.map(product => ({
        id: product.id,
        title: product.title,
        sku: product.sku || '',
        image: product.image_url || '/placeholder.svg'
      }));
    },
    enabled: searchTerm.length >= 2
  });

  const handleProductSelect = (product: Product) => {
    if (selectedProducts.length < 3) {
      setSelectedProducts(prev => [...prev, product]);
    }
  };

  const handleProductRemove = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleContinue = async () => {
    if (selectedProducts.length === 0) return;

    try {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('exposes')
        .insert({
          selected_product_ids: selectedProducts.map(p => p.id),
          status: 'draft',
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Will implement navigation to next step later
      console.log('Created expose:', data);
    } catch (error) {
      console.error('Error creating expose:', error);
      toast({
        title: "Error",
        description: "Failed to create expose. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F7]">
      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-[#1A1F2C] text-2xl font-medium">Create an Expose</h1>
          <p className="text-[#6D7175] mt-1">Generate AI-driven hero images with your products</p>
        </div>

        <div className="max-w-3xl">
          <Card className="border-0 shadow-sm">
            <CardHeader className="p-6 pb-2">
              <h2 className="text-lg font-semibold text-[#1A1F2C] mb-1">Select Products</h2>
              <p className="text-[#6D7175]">Choose up to three products to feature in your hero image</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <ProductPicker
                  onSelect={handleProductSelect}
                  selectedProducts={selectedProducts}
                  searchResults={searchResults}
                  isLoading={isLoading}
                  error={error ? 'Error loading products' : null}
                  searchTerm={searchTerm}
                  onSearch={handleSearchChange}
                />

                {selectedProducts.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-[#1A1F2C] mb-3">
                      Selected Products ({selectedProducts.length}/3)
                    </h3>
                    <div className="space-y-3">
                      {selectedProducts.map(product => (
                        <div
                          key={product.id}
                          className="flex items-center p-4 border rounded-lg border-[#E3E5E7] bg-white"
                        >
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                          <div className="ml-3 flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-[#1A1F2C] truncate">
                              {product.title}
                            </h4>
                            <p className="text-xs text-[#6D7175]">SKU: {product.sku}</p>
                          </div>
                          <Button
                            onClick={() => handleProductRemove(product.id)}
                            variant="ghost"
                            className="text-[#6D7175] hover:text-red-600 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleContinue}
                    disabled={selectedProducts.length === 0}
                    className="bg-[#008060] hover:bg-[#006e52] text-white px-6"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Expose;
