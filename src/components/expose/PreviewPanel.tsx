
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, X, CheckCircle, ArrowUpFromLine, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreviewPanelProps {
  previewContent?: React.ReactNode;  // New flexible content prop
  imageUrl?: string;  // Keep for backward compatibility
  headline: string;
  bodyCopy: string;
  isExpanded: boolean;
  isLoading: boolean;
  hasError: boolean;
  onToggleExpand: () => void;
  onPanelStateChange: (state: 'minimized' | 'preview' | 'expanded' | number) => void;
  onAddToLibrary?: () => void;
  onRegenerate?: () => void;
  showActions?: boolean;
  isMultiSlide?: boolean;
}

export const PreviewPanel = ({
  previewContent,
  imageUrl,
  headline,
  bodyCopy,
  isExpanded,
  isLoading,
  hasError,
  onToggleExpand,
  onPanelStateChange,
  onAddToLibrary,
  onRegenerate,
  showActions = false,
  isMultiSlide = false
}: PreviewPanelProps) => {
  const [isMinimized, setIsMinimized] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMinimized(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleToggleMinimize = () => {
    const newState = !isMinimized;
    setIsMinimized(newState);
    onPanelStateChange(newState ? 'minimized' : 'preview');
  };
  
  return (
    <div 
      className={cn(
        "fixed right-0 bottom-0 z-10 bg-[--p-surface] border-l border-t border-[#E3E5E7] shadow-lg transition-all duration-300 ease-in-out",
        isMinimized 
          ? "w-40 h-12 flex items-center justify-between px-4" 
          : isExpanded 
            ? "w-[500px] max-w-full h-[calc(100vh-130px)]" 
            : "w-[320px] max-w-full h-[calc(100vh-130px)]"
      )}
    >
      {isMinimized ? (
        <>
          <span className="text-sm font-medium truncate">Preview</span>
          <Button variant="ghost" size="sm" className="p-1 h-6 w-6" onClick={handleToggleMinimize}>
            <ChevronUp className="h-4 w-4" />
            <span className="sr-only">Expand</span>
          </Button>
        </>
      ) : (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E3E5E7] p-3">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-[--p-text]">
                {isMultiSlide ? 'Slide Preview' : 'Preview'}
              </h3>
              {showActions && !hasError && (
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Generated
                </span>
              )}
              {hasError && (
                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded">
                  Error
                </span>
              )}
            </div>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1 h-6 w-6 mr-1"
                onClick={onToggleExpand}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ArrowUpFromLine className="h-4 w-4" />}
                <span className="sr-only">{isExpanded ? 'Collapse' : 'Expand'}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1 h-6 w-6"
                onClick={handleToggleMinimize}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Minimize</span>
              </Button>
            </div>
          </div>
          
          {/* Preview Content */}
          <div className="flex-grow overflow-auto p-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C6ECB]"></div>
                <p className="mt-4 text-[--p-text-subdued]">Generating {isMultiSlide ? 'slides' : 'hero image'}...</p>
              </div>
            ) : hasError ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="rounded-full bg-red-100 p-3 mb-4">
                  <X className="h-6 w-6 text-red-500" />
                </div>
                <h4 className="font-medium mb-2">Generation Failed</h4>
                <p className="text-[--p-text-subdued] text-sm mb-4">There was an error generating your {isMultiSlide ? 'slides' : 'hero image'}.</p>
                {onRegenerate && (
                  <Button onClick={onRegenerate} variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Use either previewContent or fallback to imageUrl rendering */}
                {previewContent || (
                  imageUrl && (
                    <div className="relative">
                      <img 
                        src={imageUrl} 
                        alt="Generated hero"
                        className="w-full h-auto rounded-md"
                        onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                      />
                    </div>
                  )
                )}
                
                {headline && (
                  <div className="mt-4">
                    <h4 className="font-medium text-sm text-[--p-text-subdued] mb-1">Headline</h4>
                    <p className="text-[--p-text] font-semibold">{headline}</p>
                  </div>
                )}
                
                {bodyCopy && (
                  <div className="mt-3">
                    <h4 className="font-medium text-sm text-[--p-text-subdued] mb-1">Body Copy</h4>
                    <p className="text-[--p-text]">{bodyCopy}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Footer Actions */}
          {showActions && !isLoading && !hasError && (
            <div className="border-t border-[#E3E5E7] p-3 flex justify-between">
              {onRegenerate && (
                <Button onClick={onRegenerate} variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              )}
              {onAddToLibrary && (
                <Button onClick={onAddToLibrary} variant="primary" size="sm">
                  Add to Library
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
