
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Product {
  id: string;
  title: string;
  sku: string;
  image: string;
}

interface ProductPickerProps {
  onSelect: (product: Product) => void;
  selectedProducts: Product[];
}

export const ProductPicker = ({ onSelect, selectedProducts }: ProductPickerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const searchProducts = async (term: string) => {
    if (term.length < 2) {
      setResults([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('Searching products with term:', term);

      const response = await supabase.functions.invoke('sync-shopify-products', {
        body: { searchTerm: term }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      console.log('Search response:', response.data);
      const formattedProducts = response.data.products.map(product => ({
        id: product.id,
        title: product.title,
        sku: product.sku || '',
        image: product.image_url || '',
      }));

      setResults(formattedProducts);
    } catch (error) {
      console.error('Error searching products:', error);
      setError('Failed to search products. Please try again.');
      toast({
        title: "Error",
        description: "Failed to search products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    searchProducts(term);
  };

  const isProductSelected = (productId: string) => {
    return selectedProducts.some(p => p.id === productId);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="space-y-4">
          <div className="pb-4 border-b border-polaris-border">
            <div>
              <h2 className="text-[#1A1F2C] text-display-md font-medium">Search Products</h2>
              <p className="mt-1 text-polaris-secondary">
                Select up to {3 - selectedProducts.length} more product{3 - selectedProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-polaris-secondary" />
            <Input
              type="text"
              placeholder="Search products by name or SKU (type at least 2 characters)"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 border-polaris-border"
              disabled={isLoading || selectedProducts.length >= 3}
            />
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="text-center py-4">Loading products...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : selectedProducts.length >= 3 ? (
            <div className="text-center py-8">
              <p className="text-polaris-secondary">Maximum number of products selected (3)</p>
              <p className="text-sm text-polaris-secondary mt-2">
                Remove a product to select a different one
              </p>
            </div>
          ) : searchTerm.length < 2 ? (
            <div className="text-center py-8">
              <p className="text-polaris-secondary"></p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No products found matching "{searchTerm}"
            </div>
          ) : (
            results.map((product) => {
              const isSelected = isProductSelected(product.id);
              return (
                <div
                  key={product.id}
                  className={`flex items-center p-4 border rounded-md transition-colors ${
                    isSelected 
                      ? 'border-polaris-teal bg-polaris-teal/5 cursor-not-allowed' 
                      : 'border-polaris-border hover:border-polaris-teal cursor-pointer'
                  }`}
                  onClick={() => !isSelected && onSelect(product)}
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-16 h-16 object-cover rounded-md"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <div className="ml-4 flex-1">
                    <h3 className="font-medium text-polaris-text">{product.title}</h3>
                    <p className="text-sm text-polaris-secondary">SKU: {product.sku}</p>
                  </div>
                  <button
                    className={`ml-4 px-4 py-2 rounded transition-colors ${
                      isSelected
                        ? 'text-polaris-teal bg-polaris-teal/10'
                        : 'text-polaris-teal border border-polaris-teal hover:bg-polaris-teal hover:text-white'
                    }`}
                    disabled={isSelected}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
