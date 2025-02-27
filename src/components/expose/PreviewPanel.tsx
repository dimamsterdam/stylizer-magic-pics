
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, LayoutGrid } from 'lucide-react';
import GeneratedImagePreview, { ExposeLayout } from '@/components/GeneratedImagePreview';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface PreviewPanelProps {
  imageUrl: string;
  headline: string;
  bodyCopy: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onPanelStateChange?: (state: 'minimized' | 'preview' | 'expanded') => void;
}

export const PreviewPanel = ({
  imageUrl = '/placeholder.svg',
  headline,
  bodyCopy,
  isExpanded,
  onToggleExpand,
  onPanelStateChange
}: PreviewPanelProps) => {
  const [currentLayout, setCurrentLayout] = useState<ExposeLayout>('default');
  const [sheetOpen, setSheetOpen] = useState(true);
  const [shouldShowPreview, setShouldShowPreview] = useState(false);
  
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

  const layouts: { label: string; value: ExposeLayout }[] = [
    { label: 'Default', value: 'default' },
    { label: 'Reversed', value: 'reversed' },
    { label: 'Editorial', value: 'editorial' },
  ];
  
  return (
    <Sheet open={sheetOpen} modal={false}>
      <SheetContent 
        side="bottom" 
        className={`p-0 border-t border-[--p-border] shadow-xl rounded-t-2xl ${isExpanded ? 'h-[70vh]' : shouldShowPreview ? 'h-[25vh]' : 'h-[32px]'}`}
        style={{ 
          zIndex: 40,
          boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.15)'
        }}
        hideCloseButton={true}
      >
        <div className="flex flex-col h-full">
          {/* Smaller top bar with layout options on the right */}
          <div 
            className="flex items-center justify-between px-3 py-1 bg-[--p-surface] border-b border-[--p-border] cursor-grab"
            // Make the handle more prominent to indicate draggability
            style={{ touchAction: 'none' }}
          >
            <div className="flex items-center gap-2">
              <div className="h-1 w-10 bg-[--p-border-subdued] rounded-full" />
              <h3 className="font-medium text-[--p-text] ml-2 text-sm">Preview</h3>
            </div>
            <div className="flex items-center gap-1">
              {/* Layout options moved to the top bar */}
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
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpand}
                title={isExpanded ? "Collapse preview" : "Expand preview"}
                className="text-[--p-icon] h-6 w-6 p-0"
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
              </Button>
            </div>
          </div>
          
          {/* Main content area - only shown when there's content or panel is expanded */}
          {(shouldShowPreview || isExpanded) && (
            <div className="flex-1 overflow-auto p-4 bg-[--p-background]">
              <GeneratedImagePreview
                imageUrl={imageUrl}
                headline={headline || "Your headline will appear here"}
                bodyCopy={bodyCopy || "Your body copy will appear here. As you type or generate content, you'll see it update in this preview."}
                layout={currentLayout}
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
