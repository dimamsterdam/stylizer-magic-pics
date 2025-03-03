import { useState } from "react";
import { Product } from "@/types/product";
import { ProductPicker } from "@/components/ProductPicker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Stylizer = () => {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    setError(null);

    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`title.ilike.%${term}%,sku.ilike.%${term}%`)
        .limit(10);

      if (error) throw error;

      setSearchResults(data || []);
    } catch (err) {
      console.error('Error searching products:', err);
      setError('Failed to search products');
      toast({
        title: "Error",
        description: "Failed to search products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    if (selectedProducts.length < 3) {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  return (
    <div className="p-4 sm:p-6 space-y-8">
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Select Products</h2>
          <p className="text-sm text-[#6D7175]">
            Choose up to 3 products to generate lifestyle images
          </p>

          <ProductPicker
            onSelect={handleProductSelect}
            selectedProducts={selectedProducts}
            searchResults={searchResults}
            isLoading={isLoading}
            error={error}
            searchTerm={searchTerm}
            onSearch={handleSearch}
          />

          <div className="space-y-4 mt-8">
            {selectedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-medium">{product.title}</h3>
                    <p className="text-sm text-[#6D7175]">SKU: {product.sku}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => handleRemoveProduct(product.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          {selectedProducts.length > 0 && (
            <div className="flex justify-end mt-6">
              <Button>
                Generate Images
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Stylizer;
