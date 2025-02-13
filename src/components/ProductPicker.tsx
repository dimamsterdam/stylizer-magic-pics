
import { Search, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  title: string;
  sku: string;
  image: string;
}

interface ProductPickerProps {
  onSelect: (product: Product) => void;
  selectedProducts: Product[];
  searchResults: Product[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  onSearch: (term: string) => void;
}

export const ProductPicker = ({ 
  onSelect, 
  selectedProducts, 
  searchResults, 
  isLoading, 
  error,
  searchTerm,
  onSearch
}: ProductPickerProps) => {
  const { toast } = useToast();
  const isOpen = searchTerm.length >= 2;

  const isProductSelected = (productId: string) => {
    return selectedProducts.some(p => p.id === productId);
  };

  const handleProductSelect = (product: Product) => {
    if (!isProductSelected(product.id)) {
      onSelect(product);
      onSearch(''); // Clear the search input after selection
    }
  };

  const handleSearch = async (term: string) => {
    onSearch(term);
    
    if (term.length < 2) return;

    try {
      const { data, error: functionError } = await supabase.functions.invoke('sync-shopify-products', {
        body: { searchTerm: term }
      });

      if (functionError) throw functionError;

      if (data?.products) {
        // Update products in Supabase
        const { error } = await supabase
          .from('products')
          .upsert(
            data.products.map((p: any) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              sku: p.sku,
              price: p.price,
              image_url: p.image_url,
              shopify_gid: p.shopify_gid,
            }))
          );

        if (error) {
          console.error('Error syncing products to Supabase:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderSearchContent = () => {
    if (error) {
      return (
        <div className="text-center py-4 text-red-500">
          {error}
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 text-polaris-secondary animate-spin" />
          <span className="ml-2 text-polaris-secondary">Searching products...</span>
        </div>
      );
    }

    if (searchResults.length === 0) {
      if (searchTerm.length < 2) {
        return (
          <div className="text-center py-4 text-polaris-secondary">
            Type at least 2 characters to search products
          </div>
        );
      }
      return (
        <div className="text-center py-4 text-polaris-secondary">
          No products found
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {searchResults.map((product) => {
          const isSelected = isProductSelected(product.id);
          return (
            <div
              key={product.id}
              className={`flex items-center p-4 border rounded-md transition-all duration-200 ${
                isSelected 
                  ? 'border-polaris-teal bg-polaris-teal/5 cursor-not-allowed' 
                  : 'border-polaris-border hover:border-polaris-teal hover:shadow-md cursor-pointer'
              }`}
              onClick={() => !isSelected && handleProductSelect(product)}
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
        })}
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Popover open={isOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-polaris-secondary" />
            <Input
              type="text"
              placeholder="Search products by name or SKU"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 border-polaris-border bg-white/50 transition-all duration-300 focus:bg-white"
              disabled={isLoading || selectedProducts.length >= 3}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-4" 
          align="start"
          sideOffset={4}
        >
          <div className="max-h-[400px] overflow-y-auto">
            {renderSearchContent()}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
