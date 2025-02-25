
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, MessageCircle, Star, ChevronRight } from "lucide-react";

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
  return (
    <Card className="group relative bg-[--p-surface] shadow-[--p-shadow-card] hover:shadow-[--p-shadow-card-hover] transition-all duration-300">
      <div className="grid grid-cols-12 gap-4 p-6">
        {/* Left Column - Text Content */}
        <div className="col-span-7 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Badge and Menu */}
            <div className="flex items-start justify-between">
              <Badge 
                className="text-caption font-medium"
                style={{ 
                  backgroundColor: badge.bgColor,
                  color: badge.color
                }}
              >
                {badge.label}
              </Badge>
              <Button variant="ghost" size="icon" className="text-[--p-text-subdued] hover:text-[--p-text]">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Headline */}
            <h3 className="font-playfair text-display-sm font-bold text-[--p-text] leading-tight">
              {title}
            </h3>

            {/* AI Editor's Note */}
            <div className="border-l-2 border-[--p-border] pl-4">
              <p className="text-body italic text-[--p-text-subdued]">
                {"Editor's Note: This content has been featured due to its strong seasonal relevance and projected engagement metrics. Our AI analysis suggests this will resonate particularly well with our current market trends."}
              </p>
            </div>

            {/* Description */}
            <p className="text-body text-[--p-text] leading-relaxed">
              {description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-[--p-border]">
            <div className="flex items-center gap-2">
              <Button 
                size="sm"
                className="bg-[--p-action-primary] hover:bg-[--p-action-primary-hovered] text-white"
              >
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="border-[--p-border] text-[--p-text]"
              >
                Adjust
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[--p-text-subdued] hover:text-[--p-text]"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[--p-text-subdued] hover:text-[--p-text]"
              >
                <Star className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Image */}
        <div className="col-span-5 relative">
          <div className="aspect-[4/3] rounded-lg overflow-hidden">
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 text-[--p-text]"
          >
            View Details <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
