
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, LayoutGrid } from 'lucide-react';
import GeneratedImagePreview, { ExposeLayout } from '@/components/GeneratedImagePreview';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface PreviewPanelProps {
  imageUrl: string;
  headline: string;
  bodyCopy: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const PreviewPanel = ({
  imageUrl = '/placeholder.svg',
  headline,
  bodyCopy,
  isExpanded,
  onToggleExpand
}: PreviewPanelProps) => {
  const [currentLayout, setCurrentLayout] = useState<ExposeLayout>('default');
  const [sheetOpen, setSheetOpen] = useState(true);

  const layouts: { label: string; value: ExposeLayout }[] = [
    { label: 'Default', value: 'default' },
    { label: 'Reversed', value: 'reversed' },
    { label: 'Editorial', value: 'editorial' },
  ];
  
  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen} modal={false}>
      <SheetContent 
        side="bottom" 
        className={`p-0 border-t border-[--p-border] shadow-lg rounded-t-lg ${isExpanded ? 'h-[70vh]' : 'h-[40vh]'}`}
        style={{ zIndex: 40 }}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-3 bg-[--p-surface] border-b border-[--p-border] cursor-grab">
            <div className="flex items-center gap-2">
              <div className="h-1 w-10 bg-[--p-border-subdued] rounded-full mx-auto" />
              <h3 className="font-medium text-[--p-text] ml-2">Preview</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpand}
                title={isExpanded ? "Collapse preview" : "Expand preview"}
                className="text-[--p-icon]"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-4 bg-[--p-background]">
            <GeneratedImagePreview
              imageUrl={imageUrl}
              headline={headline || "Your headline will appear here"}
              bodyCopy={bodyCopy || "Your body copy will appear here. As you type or generate content, you'll see it update in this preview."}
              layout={currentLayout}
            />
          </div>
          
          <div className="p-3 bg-[--p-surface] border-t border-[--p-border]">
            <div className="flex flex-wrap gap-2 items-center">
              <LayoutGrid className="h-4 w-4 text-[--p-text-subdued] mr-1" />
              <span className="text-sm text-[--p-text-subdued] mr-2">Layout:</span>
              {layouts.map((layout) => (
                <Button
                  key={layout.value}
                  variant={currentLayout === layout.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentLayout(layout.value)}
                  className={currentLayout === layout.value ? "bg-[--p-action-primary] text-white" : "text-[--p-text]"}
                >
                  {layout.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
