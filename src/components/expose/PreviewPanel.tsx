
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, LayoutGrid, MoreVertical, Save, RotateCw, ExternalLink } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import GeneratedImagePreview, { ExposeLayout } from '@/components/GeneratedImagePreview';

interface PreviewPanelProps {
  imageUrl: string;
  headline: string;
  bodyCopy: string;
  isExpanded: boolean;
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
  onToggleExpand,
  onPanelStateChange,
  onAddToLibrary,
  onRegenerate,
  showActions = false
}: PreviewPanelProps) => {
  const [currentLayout, setCurrentLayout] = useState<ExposeLayout>('reversed');
  const [shouldShowPreview, setShouldShowPreview] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  
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

  const handleToggleExpand = () => {
    onToggleExpand();
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
      className="fixed right-0 top-[129px] bottom-0 bg-white border-l border-[--p-border] shadow-xl z-40 transition-all duration-300 ease-in-out"
      style={{ 
        width,
        boxShadow: '-4px 0px 20px rgba(0, 0, 0, 0.15)',
      }}
    >
      <div className="flex h-full">
        {/* Side tab for collapse/expand */}
        <div 
          className="w-10 border-r border-[--p-border] bg-[--p-surface] flex flex-col items-center pt-4"
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
              className="flex items-center justify-between px-3 py-2 bg-[--p-surface] border-b border-[--p-border]"
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
                  <GeneratedImagePreview
                    imageUrl={imageUrl}
                    headline={headline || "Your headline will appear here"}
                    bodyCopy={bodyCopy || "Your body copy will appear here. As you type or generate content, you'll see it update in this preview."}
                    layout={currentLayout}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
