
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, MessageCircle, Star } from "lucide-react";

interface ContentCardProps {
  title: string;
  description: string;
  badge: {
    label: string;
    color: string;
    bgColor: string;
  };
}

export const ContentCard = ({ title, description, badge }: ContentCardProps) => {
  return (
    <Card className="group relative overflow-hidden bg-[--p-surface] shadow-[--p-shadow-card] hover:shadow-[--p-shadow-card-hover] transition-all duration-300 h-[360px]">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full bg-[--p-background-subdued]">
        <div className="w-full h-full bg-gradient-to-b from-transparent via-black/30 to-black/60" />
      </div>

      {/* Content Overlay */}
      <div className="relative h-full flex flex-col">
        {/* Top Section with Badge and Menu */}
        <div className="p-4 flex items-start justify-between">
          <Badge 
            className="text-caption font-medium"
            style={{ 
              backgroundColor: badge.bgColor,
              color: badge.color
            }}
          >
            {badge.label}
          </Badge>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        {/* Bottom Section with Text and Actions */}
        <div className="mt-auto p-4 text-white">
          <h3 className="text-display-sm font-medium mb-2">
            {title}
          </h3>
          <p className="text-body text-white/80 mb-4">
            {description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm h-8"
              >
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="bg-black/20 hover:bg-black/30 text-white border-white/20 h-8 backdrop-blur-sm"
              >
                Adjust
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/10"
              >
                <Star className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
