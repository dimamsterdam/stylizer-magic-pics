
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, MessageCircle, Star, Image } from "lucide-react";

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
    <Card className="bg-[--p-surface] shadow-[--p-shadow-card] hover:shadow-[--p-shadow-card-hover] transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge 
            className="font-medium"
            style={{ 
              backgroundColor: badge.bgColor,
              color: badge.color
            }}
          >
            {badge.label}
          </Badge>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle className="text-base font-medium text-[--p-text] mt-2">
          {title}
        </CardTitle>
        <CardDescription className="text-[--p-text-subdued]">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video relative rounded-lg bg-[--p-background-subdued] overflow-hidden">
          <Image className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              size="sm"
              className="bg-[--p-action-primary] hover:bg-[--p-action-primary-hovered] text-white h-8"
            >
              Approve
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="border-[--p-border] text-[--p-text] h-8"
            >
              Adjust
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <MessageCircle className="h-4 w-4 text-[--p-icon]" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <Star className="h-4 w-4 text-[--p-icon]" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
