
import { Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

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
  searchResults: initialSearchResults, 
  isLoading: initialIsLoading, 
  error: initialError,
  searchTerm: initialSearchTerm,
  onSearch
}: ProductPickerProps) => {
  const { toast } = useToast();
  
  // Local state to manage input and search
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [searchResults, setSearchResults] = useState<Product[]>(initialSearchResults || []);
  const [isLoading, setIsLoading] = useState(initialIsLoading);
  const [error, setError] = useState(initialError);
  const [open, setOpen] = useState(false);
  
  // Update local state when props change
  useEffect(() => {
    setSearchResults(initialSearchResults || []);
    setIsLoading(initialIsLoading);
    setError(initialError);
    setSearchTerm(initialSearchTerm);
  }, [initialSearchResults, initialIsLoading, initialError, initialSearchTerm]);
  
  const isProductSelected = (productId: string) => {
    return selectedProducts.some(p => p.id === productId);
  };

  const handleProductSelect = (product: Product) => {
    if (!isProductSelected(product.id)) {
      onSelect(product);
      setSearchTerm('');
      setOpen(false);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    onSearch(term);
    
    // Only open the popover when there's at least 2 characters
    setOpen(term.length >= 2);
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
          <Loader2 className="h-6 w-6 text-[#333333] animate-spin" />
          <span className="ml-2 text-[#333333]">Searching products...</span>
        </div>
      );
    }

    if (searchResults.length === 0) {
      if (searchTerm.length < 2) {
        return (
          <div className="text-center py-4 text-[#6D7175]">
            Type at least 2 characters to search products
          </div>
        );
      }
      return (
        <div className="text-center py-4 text-[#6D7175]">
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
                  ? 'border-black bg-black/5 cursor-not-allowed' 
                  : 'border-[#E3E5E7] hover:border-black hover:shadow-md cursor-pointer'
              }`}
              onClick={() => !isSelected && handleProductSelect(product)}
            >
              <img
                src={product.image}
                alt={product.title}
                className="w-16 h-16 object-cover rounded-md"
                onError={(e) => {
                  // If image fails to load, use placeholder
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <div className="ml-4 flex-1">
                <h3 className="font-medium text-black">{product.title}</h3>
                <p className="text-sm text-[#6D7175]">SKU: {product.sku}</p>
              </div>
              <button
                type="button"
                className={`ml-4 px-4 py-2 rounded transition-colors ${
                  isSelected
                    ? 'text-[#333333] bg-[#F6F6F7]'
                    : 'text-white bg-black hover:bg-[#333333]'
                }`}
                disabled={isSelected}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent the parent div's onClick from firing
                  if (!isSelected) {
                    handleProductSelect(product);
                  }
                }}
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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6D7175]" />
            <Input
              type="text"
              placeholder="Search products by name or SKU"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 border-[#E3E5E7] bg-white/50 transition-all duration-300 focus:bg-white focus:border-black"
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
