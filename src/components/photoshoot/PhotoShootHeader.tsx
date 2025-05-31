
import React from 'react';
import Breadcrumbs from "@/components/Breadcrumbs";

export const PhotoShootHeader = () => {
  return (
    <div className="border-b border-[--p-border-subdued] bg-[--p-surface]">
      <div className="px-5 py-4">
        <Breadcrumbs className="mb-4" items={[
          { label: 'Home', href: '/' },
          { label: 'Product Photo Shoot', href: '/product-photo-shoot' }
        ]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display-lg text-[--p-text]">Product Photo Shoot</h1>
            <p className="mt-1 text-body text-[--p-text-subdued]">
              Generate professional product photos for your Shopify store
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
