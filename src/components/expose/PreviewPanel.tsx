
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, LayoutGrid, MoreVertical, Save, RotateCw, ExternalLink, AlertTriangle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import GeneratedImagePreview, { ExposeLayout } from '@/components/GeneratedImagePreview';
import { Skeleton } from '@/components/ui/skeleton';

interface PreviewPanelProps {
  imageUrl: string;
  headline: string;
  bodyCopy: string;
  isExpanded: boolean;
  isLoading?: boolean;
  hasError?: boolean;
  onToggleExpand: () => void;
  onPanelStateChange?: (state: 'minimized' | 'preview' | 'expanded' | number) => void;
  onAddToLibrary?: () => void;
  onRegenerate?: () => void;
  showActions?: boolean;
}

export const PreviewPanel = ({
  imageUrl = '/placeholder.svg',
  headline,
  bodyCopy,
  isExpanded,
  isLoading = false,
  hasError = false,
  onToggleExpand,
  onPanelStateChange,
  onAddToLibrary,
  onRegenerate,
  showActions = false
}: PreviewPanelProps) => {
  const [currentLayout, setCurrentLayout] = useState<ExposeLayout>('reversed');
  const [shouldShowPreview, setShouldShowPreview] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevHeadlineRef = useRef<string>('');
  
  // Reset image load error when imageUrl changes
  useEffect(() => {
    setImageLoadError(false);
  }, [imageUrl]);
  
  // Effect to check if content is available and show preview
  useEffect(() => {
    // Show preview when content is available
    if ((headline && headline.trim() !== '') || (bodyCopy && bodyCopy.trim() !== '')) {
      setShouldShowPreview(true);
    }
  }, [headline, bodyCopy]);
  
  // Effect to notify parent of panel state changes
  useEffect(() => {
    if (onPanelStateChange) {
      if (isExpanded) {
        onPanelStateChange('expanded');
      } else if (shouldShowPreview) {
        onPanelStateChange('preview');
      } else {
        onPanelStateChange('minimized');
      }
    }
  }, [isExpanded, shouldShowPreview, onPanelStateChange]);

  // Effect to auto-expand panel when headline is newly generated
  useEffect(() => {
    // Only trigger if we have a headline and it's different from the previous one
    if (headline && headline.trim() !== '' && headline !== prevHeadlineRef.current && !isExpanded) {
      // Only auto-expand if there was no headline before or if the headline significantly changed
      if (prevHeadlineRef.current === '' || headline.length > prevHeadlineRef.current.length + 5) {
        onToggleExpand();
      }
    }
    
    // Update the ref with current headline for next comparison
    prevHeadlineRef.current = headline || '';
  }, [headline, isExpanded, onToggleExpand]);

  const handleToggleExpand = () => {
    onToggleExpand();
  };

  const handleImageError = () => {
    console.log("Image failed to load:", imageUrl);
    setImageLoadError(true);
  };

  // Updated layout options
  const layouts: { label: string; value: ExposeLayout }[] = [
    { label: 'Top', value: 'reversed' },
    { label: 'Bottom', value: 'default' },
    { label: 'Editorial', value: 'editorial' },
  ];
  
  // Set panel width based on expansion state
  const width = isExpanded ? '320px' : '40px';
  
  return (
    <div 
      ref={panelRef}
      className="fixed right-0 top-[129px] bottom-0 bg-white border-l border-[#E3E5E7] shadow-xl z-40 transition-all duration-300 ease-in-out"
      style={{ 
        width,
        boxShadow: '-4px 0px 20px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="flex h-full">
        {/* Side tab for collapse/expand */}
        <div 
          className="w-10 border-r border-[#E3E5E7] bg-[--p-surface] flex flex-col items-center pt-4"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleExpand}
            title={isExpanded ? "Collapse preview" : "Expand preview"}
            className="text-[--p-icon] h-8 w-8 p-0 mb-4"
          >
            {isExpanded ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          
          {isExpanded && (
            <a 
              href="#" 
              target="_blank" 
              rel="noopener noreferrer" 
              title="View in desktop"
              className="text-[--p-icon] h-8 w-8 p-0 flex items-center justify-center hover:bg-[--p-surface-hovered] rounded-md"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
        
        {/* Main content area - only shown when expanded */}
        {isExpanded && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top bar with controls */}
            <div 
              className="flex items-center justify-between px-3 py-2 bg-[--p-surface] border-b border-[#E3E5E7]"
            >
              <h3 className="font-medium text-[--p-text] text-sm">Mobile Preview</h3>
              <div className="flex items-center gap-1">
                {/* Layout options */}
                <div className="flex gap-1 items-center mr-2">
                  <LayoutGrid className="h-3 w-3 text-[--p-text-subdued]" />
                  {layouts.map((layout) => (
                    <Button
                      key={layout.value}
                      variant={currentLayout === layout.value ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentLayout(layout.value)}
                      className={`text-xs py-0.5 px-2 h-6 ${currentLayout === layout.value ? "bg-[--p-action-primary] text-white" : "text-[--p-text]"}`}
                    >
                      {layout.label}
                    </Button>
                  ))}
                </div>
                
                {/* Actions menu */}
                {showActions && onAddToLibrary && onRegenerate && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 mr-1">
                        <MoreVertical className="h-3 w-3 text-[--p-text-subdued]" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px]">
                      <DropdownMenuItem onClick={onAddToLibrary}>
                        <Save className="mr-2 h-4 w-4" />
                        <span>Add to Library</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onRegenerate}>
                        <RotateCw className="mr-2 h-4 w-4" />
                        <span>Regenerate</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            
            {/* Mobile device frame with content */}
            <div className="flex-1 overflow-auto p-4 bg-[--p-background] flex items-center justify-center">
              <div className="mobile-device-frame">
                <div className="mobile-device-notch"></div>
                <div className="mobile-content overflow-auto">
                  {isLoading ? (
                    <div className="bg-white rounded-lg overflow-hidden">
                      <div className="grid grid-cols-1 min-h-[480px]">
                        <Skeleton className="w-full h-full" />
                      </div>
                    </div>
                  ) : hasError || imageLoadError ? (
                    <div className="bg-white rounded-lg overflow-hidden p-6 text-center min-h-[480px] flex flex-col items-center justify-center">
                      <AlertTriangle className="h-12 w-12 text-orange-500 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Image Generation Failed</h3>
                      <p className="text-gray-600 mb-4">There was a problem generating the image. Please try again.</p>
                      {onRegenerate && (
                        <Button onClick={onRegenerate} variant="secondary">
                          <RotateCw className="mr-2 h-4 w-4" />
                          Try Again
                        </Button>
                      )}
                    </div>
                  ) : (
                    <GeneratedImagePreview
                      imageUrl={imageUrl}
                      headline={headline || "Your headline will appear here"}
                      bodyCopy={bodyCopy || "Your body copy will appear here. As you type or generate content, you'll see it update in this preview."}
                      layout={currentLayout}
                      onImageLoadError={handleImageError}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
