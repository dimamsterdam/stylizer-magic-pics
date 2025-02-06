import { useState } from "react";
import { ProductPicker } from "@/components/ProductPicker";
import { ImageGallery } from "@/components/ImageGallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Product {
  id: string;
  title: string;
  sku: string;
  image: string;
}

interface Image {
  id: string;
  url: string;
  selected: boolean;
}

const Index = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [prompt, setPrompt] = useState("");

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    // Simulate loading product images
    setImages([
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1482881497185-d4a9ddbe4151",
        selected: false,
      },
      {
        id: "2",
        url: product.image,
        selected: false,
      },
    ]);
  };

  const handleImageSelect = (id: string) => {
    setImages(
      images.map((img) =>
        img.id === id ? { ...img, selected: !img.selected } : img
      )
    );
  };

  const handleImageRemove = (id: string) => {
    setImages(images.filter((img) => img.id !== id));
  };

  const canStartGeneration = selectedProduct && images.some((img) => img.selected) && prompt.trim();

  return (
    <div className="min-h-screen bg-polaris-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-polaris-text mb-8">
          Welcome to Stylizer
        </h1>
        <p className="text-polaris-secondary mb-8 max-w-2xl">
          Transform your product pack shots into stunning fashion photography with AI.
          Select a product, choose your pack shots, and let our AI create
          beautiful styled images for your store.
        </p>

        {!selectedProduct ? (
          <ProductPicker onSelect={handleProductSelect} />
        ) : (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-polaris-text mb-4">
                Selected Product: {selectedProduct.title}
              </h2>
              <p className="text-polaris-secondary">SKU: {selectedProduct.sku}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-polaris-text mb-4">
                Product Images
              </h2>
              <ImageGallery
                images={images}
                onSelect={handleImageSelect}
                onRemove={handleImageRemove}
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-polaris-text mb-4">
                Style Prompt
              </h2>
              <Input
                placeholder="Describe the style you want (e.g., 'Professional model wearing the shirt in an urban setting')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mb-4"
              />
              <Button
                className="bg-polaris-green hover:bg-polaris-teal text-white"
                disabled={!canStartGeneration}
              >
                Start Generation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;