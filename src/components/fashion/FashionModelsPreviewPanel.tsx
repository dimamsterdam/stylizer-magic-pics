
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Users, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [currentModelIndex, setCurrentModelIndex] = useState(0);

  const currentModel = models[currentModelIndex];

  const handleNextModel = () => {
    if (currentModelIndex < models.length - 1) {
      setCurrentModelIndex(currentModelIndex + 1);
    }
  };

  const handlePrevModel = () => {
    if (currentModelIndex > 0) {
      setCurrentModelIndex(currentModelIndex - 1);
    }
  };

  const handleStarClick = () => {
    if (currentModel) {
      onStarModel(currentModel);
      // Move to next model if available
      if (currentModelIndex < models.length - 1) {
        setCurrentModelIndex(currentModelIndex + 1);
      } else if (currentModelIndex > 0) {
        setCurrentModelIndex(currentModelIndex - 1);
      }
    }
  };

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

    if (currentModel) {
      return (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-[#E3E5E7]">
            <h3 className="font-medium text-[--p-text] mb-1">
              {currentModel.name}
            </h3>
            <p className="text-sm text-[--p-text-subdued]">
              {currentModelIndex + 1} of {models.length} • {currentModel.gender}
            </p>
          </div>

          {/* Model Image */}
          <div className="flex-1 p-4">
            <div className="relative">
              {currentModel.imageUrl ? (
                <img
                  src={currentModel.imageUrl}
                  alt={currentModel.name}
                  className="w-full h-auto rounded-lg max-h-96 object-cover mx-auto"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Users className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Description */}
            <div className="mt-4">
              <p className="text-sm text-[--p-text]">{currentModel.description}</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4 border-t border-[#E3E5E7]">
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentModelIndex === 0}
                onClick={handlePrevModel}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <div className="flex gap-1">
                {models.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      currentModelIndex === index
                        ? 'bg-[#2C6ECB]'
                        : 'bg-gray-300'
                    }`}
                    onClick={() => setCurrentModelIndex(index)}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentModelIndex === models.length - 1}
                onClick={handleNextModel}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Star Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleStarClick}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              <Star className="mr-2 h-5 w-5" />
              Star Model
            </Button>
          </div>
        </div>
      );
    }

    return null;
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
