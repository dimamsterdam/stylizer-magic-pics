import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  title: string;
  sku: string;
  image: string;
}

interface ProductPickerProps {
  onSelect: (product: Product) => void;
}

const dummyProducts: Product[] = [
  {
    id: "1",
    title: "Classic White T-Shirt",
    sku: "WT001",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop",
  },
  {
    id: "2",
    title: "Denim Jeans",
    sku: "DJ002",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=200&fit=crop",
  },
  {
    id: "3",
    title: "Summer Dress",
    sku: "SD003",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=200&fit=crop",
  },
  {
    id: "4",
    title: "Classic Cream Sweater",
    sku: "CS004",
    image: "/lovable-uploads/9bac9fd0-2115-4bae-8108-0b973f83db37.png",
  },
];

export const ProductPicker = ({ onSelect }: ProductPickerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Product[]>([]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = dummyProducts.filter(
      (product) =>
        product.title.toLowerCase().includes(term.toLowerCase()) ||
        product.sku.toLowerCase().includes(term.toLowerCase())
    );
    setResults(filtered);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-polaris-secondary" />
        <Input
          type="text"
          placeholder="Search products by name or SKU"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 border-polaris-border"
        />
      </div>
      <div className="space-y-4">
        {results.map((product) => (
          <div
            key={product.id}
            className="flex items-center p-4 border border-polaris-border rounded-md hover:border-polaris-teal cursor-pointer transition-colors"
            onClick={() => onSelect(product)}
          >
            <img
              src={product.image}
              alt={product.title}
              className="w-16 h-16 object-cover rounded-md"
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
        ))}
      </div>
    </div>
  );
};