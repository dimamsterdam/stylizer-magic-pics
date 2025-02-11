
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadInitialProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(10);

        if (error) throw error;

        const formattedProducts = data.map(product => ({
          id: product.id,
          title: product.title,
          sku: product.sku || '',
          image: product.image_url || '',
        }));

        setResults(formattedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialProducts();
  }, []);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    
    if (term.trim() === "") {
      const { data } = await supabase
        .from('products')
        .select('*')
        .limit(10);
      
      setResults(data?.map(product => ({
        id: product.id,
        title: product.title,
        sku: product.sku || '',
        image: product.image_url || '',
      })) || []);
      return;
    }
    
    const { data } = await supabase
      .from('products')
      .select('*')
      .or(`title.ilike.%${term}%,sku.ilike.%${term}%`)
      .limit(10);
    
    setResults(data?.map(product => ({
      id: product.id,
      title: product.title,
      sku: product.sku || '',
      image: product.image_url || '',
    })) || []);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="space-y-4">
          <div className="pb-4 border-b border-polaris-border">
            <h2 className="text-[#1A1F2C] text-display-md font-medium">Get started</h2>
            <p className="mt-1 text-polaris-secondary">Search and select a product to begin</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-polaris-secondary" />
            <Input
              type="text"
              placeholder="Search products by name or SKU"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 border-polaris-border"
            />
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="text-center py-4">Loading products...</div>
          ) : results.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No products found
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
                <Button
                  variant="outline"
                  className="ml-4 text-polaris-teal border-polaris-teal hover:bg-polaris-teal hover:text-white"
                >
                  Select
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
