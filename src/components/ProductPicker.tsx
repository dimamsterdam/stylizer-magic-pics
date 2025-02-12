
import { Search } from "lucide-react";
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
  searchResults: Product[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
}

export const ProductPicker = ({ 
  onSelect, 
  selectedProducts, 
  searchResults, 
  isLoading, 
  error,
  searchTerm 
}: ProductPickerProps) => {
  const { toast } = useToast();

  const isProductSelected = (productId: string) => {
    return selectedProducts.some(p => p.id === productId);
  };

  const shouldShowResults = searchTerm.length >= 2 && searchResults.length > 0 && !isLoading && !error;

  if (!shouldShowResults) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-sm animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
        <div className="space-y-4">
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
          })}
        </div>
      </div>
    </div>
  );
};
