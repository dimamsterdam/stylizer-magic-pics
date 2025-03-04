
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface VideoUploadPanelProps {
  setVideoUrl: (url: string | null) => void;
}

export const VideoUploadPanel: React.FC<VideoUploadPanelProps> = ({ setVideoUrl }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        handleFile(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setVideoUrl(url);
  };

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedFile(null);
    setPreviewUrl(null);
    setVideoUrl(null);
  };

  const uploadVideo = async () => {
    if (!uploadedFile) return;
    
    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
    }, 2000);
    
    // In a real app, you would upload to Supabase Storage or a CDN
    // const { data, error } = await supabaseClient.storage
    //   .from('videos')
    //   .upload(`product-videos/${Date.now()}-${uploadedFile.name}`, uploadedFile);
    
    // if (data) {
    //   const publicUrl = supabaseClient.storage.from('videos').getPublicUrl(data.path).data.publicUrl;
    //   setVideoUrl(publicUrl);
    // }
  };

  return (
    <div className="space-y-4">
      {!uploadedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Drag and drop your video</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Support for MP4, MOV, or WebM files
          </p>
          <div>
            <label htmlFor="video-upload" className="cursor-pointer">
              <Button variant="outline" type="button">Browse files</Button>
              <input
                id="video-upload"
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileInput}
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <video 
              src={previewUrl || undefined} 
              controls 
              className="w-full h-auto rounded-lg border"
            />
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 rounded-full"
              onClick={removeFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="font-medium">{uploadedFile.name}</p>
              <p className="text-muted-foreground">
                {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <Button 
              variant="primary" 
              onClick={uploadVideo}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Complete Upload"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
