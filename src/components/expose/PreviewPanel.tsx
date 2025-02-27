
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Expand, Minimize } from 'lucide-react';
import GeneratedImagePreview, { ExposeLayout } from '@/components/GeneratedImagePreview';

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

  const layouts: { label: string; value: ExposeLayout }[] = [
    { label: 'Default', value: 'default' },
    { label: 'Reversed', value: 'reversed' },
    { label: 'Editorial', value: 'editorial' },
  ];
  
  return (
    <div className="flex flex-col h-[calc(100vh-129px)] border-l border-[--p-border]">
      <div className="flex items-center justify-between p-4 bg-[--p-surface] border-b border-[--p-border]">
        <h3 className="font-medium text-[--p-text]">Preview</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleExpand}
          title={isExpanded ? "Collapse preview" : "Expand preview"}
        >
          {isExpanded ? <Minimize className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto p-4 bg-[--p-background]">
        <GeneratedImagePreview
          imageUrl={imageUrl}
          headline={headline || "Your headline will appear here"}
          bodyCopy={bodyCopy || "Your body copy will appear here. As you type or generate content, you'll see it update in this preview."}
          layout={currentLayout}
        />
      </div>
      
      <div className="p-4 bg-[--p-surface] border-t border-[--p-border]">
        <div className="flex flex-wrap gap-2">
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
  );
};
