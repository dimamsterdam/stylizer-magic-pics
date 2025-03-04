
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Film } from "lucide-react";

interface VideoPreviewPanelProps {
  videoUrl: string | null;
  title: string;
  description: string;
}

export const VideoPreviewPanel: React.FC<VideoPreviewPanelProps> = ({
  videoUrl,
  title,
  description
}) => {
  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>Video Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {videoUrl ? (
          <video 
            src={videoUrl} 
            controls 
            className="w-full h-auto rounded-lg border"
          />
        ) : (
          <div className="border rounded-lg flex items-center justify-center p-12 bg-muted/20">
            <div className="text-center">
              <Film className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Video preview will appear here</p>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className="font-medium text-lg">
            {title || "Video Title"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {description || "Video description will appear here once you add details."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
