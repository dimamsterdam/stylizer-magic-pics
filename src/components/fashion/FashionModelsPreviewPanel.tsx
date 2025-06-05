
import React from 'react';
import { Star, Users } from "lucide-react";

interface Model {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  gender: string;
  starred: boolean;
}

interface FashionModelsPreviewPanelProps {
  models: Model[];
  isGenerating: boolean;
  onStarModel: (model: Model) => void;
}

export const FashionModelsPreviewPanel = ({
  models,
  isGenerating,
  onStarModel
}: FashionModelsPreviewPanelProps) => {
  const renderContent = () => {
    if (isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C6ECB] mb-4"></div>
          <h3 className="text-lg font-medium text-[--p-text] mb-2">Generating models</h3>
          <p className="text-[--p-text-subdued] text-center">
            Creating fashion models based on your brand identity...
          </p>
        </div>
      );
    }

    if (models.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="w-32 h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
            <Users className="w-16 h-16 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-[--p-text] mb-2">Generated models will appear here</h3>
          <p className="text-[--p-text-subdued]">
            Select a gender and generate models to preview them in this panel
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4 p-4">
        {models.map((model) => (
          <div key={model.id} className="relative group cursor-pointer" onClick={() => onStarModel(model)}>
            <div className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden">
              {model.imageUrl ? (
                <img
                  src={model.imageUrl}
                  alt={model.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Users className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Star overlay */}
            <div className="absolute top-2 right-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-white/90 transition-colors">
                <Star className="h-5 w-5 text-gray-400 hover:text-yellow-500 transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full bg-[--p-surface] border-l border-[#E3E5E7]">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-[#E3E5E7]">
          <h2 className="text-lg font-medium text-[--p-text]">Preview</h2>
        </div>
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
