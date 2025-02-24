
import React from 'react';
import { Button } from "@/components/ui/button";
import { MoreVertical, RotateCw, Save } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GalleryControlBarProps {
  currentIndex: number;
  totalCount: number;
  onRegenerate?: () => void;
  onSave?: () => void;
}

export const GalleryControlBar = ({ 
  currentIndex, 
  totalCount,
  onRegenerate,
  onSave
}: GalleryControlBarProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-[--p-surface] border-b border-[--p-border]">
      <div className="flex items-center gap-2">
        <span className="text-[--p-text-subdued] text-sm">
          Variation {currentIndex + 1} of {totalCount}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          className="text-[--p-text]"
        >
          <RotateCw className="h-4 w-4 mr-2" />
          Regenerate
        </Button>
        <Button 
          variant="ghost"
          size="sm"
          onClick={onSave}
          className="text-[--p-text]"
        >
          <Save className="h-4 w-4 mr-2" />
          Save to Library
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled>
              Change Layout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
