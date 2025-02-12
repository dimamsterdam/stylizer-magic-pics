
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

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-sm">
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
          ) : searchResults.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No products found matching "{searchTerm}"
            </div>
          ) : (
            searchResults.map((product) => {
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
