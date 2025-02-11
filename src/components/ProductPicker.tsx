
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
}

export const ProductPicker = ({ onSelect }: ProductPickerProps) => {
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

  // Handle search input changes
  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    searchProducts(term);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="space-y-4">
          <div className="pb-4 border-b border-polaris-border">
            <div>
              <h2 className="text-[#1A1F2C] text-display-md font-medium">Get started</h2>
              <p className="mt-1 text-polaris-secondary">Search and select a product to begin</p>
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
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="text-center py-4">Loading products...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : searchTerm.length < 2 ? (
            <div className="text-center py-8">
              <p className="text-polaris-secondary">Start typing to search for products</p>
              <p className="text-sm text-polaris-secondary mt-2">
                Search by product name or SKU (minimum 2 characters)
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No products found matching "{searchTerm}"
            </div>
          ) : (
            results.map((product) => (
              <div
                key={product.id}
                className="flex items-center p-4 border border-polaris-border rounded-md hover:border-polaris-teal cursor-pointer transition-colors"
                onClick={() => onSelect(product)}
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
                  className="ml-4 px-4 py-2 text-polaris-teal border border-polaris-teal rounded hover:bg-polaris-teal hover:text-white transition-colors"
                >
                  Select
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
