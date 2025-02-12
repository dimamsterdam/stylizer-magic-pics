
import { Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  const isOpen = searchTerm.length >= 2 && !error;

  const isProductSelected = (productId: string) => {
    return selectedProducts.some(p => p.id === productId);
  };

  const handleProductSelect = (product: Product) => {
    if (!isProductSelected(product.id)) {
      onSelect(product);
      onSearch(''); // Clear the search input after selection
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Popover open={isOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-polaris-secondary" />
            <Input
              type="text"
              placeholder="Search products by name or SKU (type at least 2 characters)"
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10 border-polaris-border bg-white/50 transition-all duration-300 focus:bg-white"
              disabled={isLoading || selectedProducts.length >= 3}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-0" 
          align="start"
          sideOffset={4}
        >
          <div className="max-h-[400px] overflow-y-auto shadow-lg rounded-lg">
            <div className="p-4 bg-white space-y-2">
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
              {searchResults.length === 0 && searchTerm.length >= 2 && (
                <div className="text-center py-4 text-polaris-secondary">
                  No products found
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
