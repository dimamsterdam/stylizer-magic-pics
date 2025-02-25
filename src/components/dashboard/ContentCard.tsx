
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ThumbsUp, 
  Copy, 
  PenLine, 
  X, 
  Send,
  Sparkles,
  MoreVertical,
  ChevronUp,
  ChevronDown
} from "lucide-react";

interface ContentCardProps {
  title: string;
  description: string;
  imageUrl: string;
  badge: {
    label: string;
    color: string;
    bgColor: string;
  };
}

export const ContentCard = ({ title, description, imageUrl, badge }: ContentCardProps) => {
  const [showInsights, setShowInsights] = useState(false);

  return (
    <Card className="overflow-hidden bg-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Image Section */}
      <div className="relative h-[280px] bg-gray-100">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover"
        />
        
        {/* Badge Overlay - Now at bottom */}
        <div className="absolute bottom-4 left-4">
          <Badge 
            className="px-3 py-1.5 text-sm font-medium rounded-full"
            style={{ 
              backgroundColor: badge.bgColor,
              color: badge.color,
              backdropFilter: 'blur(4px)'
            }}
          >
            {badge.label}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-[24px] font-semibold text-gray-900 leading-tight">
            {title}
          </h3>
          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
        
        <p className="text-gray-600 text-base">
          {description}
        </p>

        {/* AI Insights Section */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 h-auto font-medium flex items-center gap-2"
            onClick={() => setShowInsights(!showInsights)}
          >
            <Sparkles className="h-4 w-4" />
            AI insights
            {showInsights ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {showInsights && (
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <p className="text-gray-700">
                Based on your sales data, knit accessories and waterproof boots have seen a 32% increase in the past two weeks. The current cold snap in your top markets is expected to continue.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-4 mt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
              <ThumbsUp className="h-5 w-5 text-gray-600" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
              <Copy className="h-5 w-5 text-gray-600" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
              <PenLine className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
              <X className="h-5 w-5 text-gray-600" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
              <Send className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
