
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
  Sparkles
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    <>
      <Card className="overflow-hidden bg-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        {/* Image Section */}
        <div className="relative h-[280px] bg-gray-100">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
          
          {/* Badge Overlay */}
          <div className="absolute top-4 left-4">
            <Badge 
              className="px-3 py-1.5 text-sm font-medium rounded-full"
              style={{ 
                backgroundColor: 'rgba(219, 234, 254, 0.9)', // Light blue with opacity
                color: '#2563EB',
                backdropFilter: 'blur(4px)'
              }}
            >
              {badge.label}
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          <h3 className="text-[24px] font-semibold text-gray-900 leading-tight">
            {title}
          </h3>
          
          <p className="text-gray-600 text-base">
            {description}
          </p>

          {/* AI Insights Button */}
          <Button
            variant="ghost"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 h-auto font-medium flex items-center gap-2"
            onClick={() => setShowInsights(true)}
          >
            <Sparkles className="h-4 w-4" />
            Show AI insights
          </Button>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <ThumbsUp className="h-5 w-5 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon">
                <Copy className="h-5 w-5 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon">
                <PenLine className="h-5 w-5 text-gray-600" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon">
                <Send className="h-5 w-5 text-blue-600" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* AI Insights Dialog */}
      <Dialog open={showInsights} onOpenChange={setShowInsights}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>AI Insights for {title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Why this content was proposed:</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <span>High seasonal relevance based on current winter trends and historical data</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <span>Similar content has shown strong engagement rates in your target demographic</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <span>Aligns with your brand's visual identity and color palette preferences</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <h4 className="font-medium text-gray-900 mb-2">Predicted Performance:</h4>
              <p className="text-gray-600">Expected engagement rate: 4.2% (32% higher than average)</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
