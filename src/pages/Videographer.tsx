
import React, { useState } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ProductPicker } from "@/components/ProductPicker";
import { Home, Upload, Film } from "lucide-react";
import { VideoUploadPanel } from "@/components/videographer/VideoUploadPanel";
import { VideoGenerationPanel } from "@/components/videographer/VideoGenerationPanel";
import { VideoPreviewPanel } from "@/components/videographer/VideoPreviewPanel";

const Videographer = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">
              <Home className="h-4 w-4" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Videographer</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Videographer</h1>
          <p className="text-muted-foreground">Create and manage product videos for your store</p>
        </div>
        <Button variant="primary" disabled={!videoTitle || !selectedProduct}>
          Save Video
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Creator</CardTitle>
              <CardDescription>Upload or generate product videos</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="generate">
                    <Film className="mr-2 h-4 w-4" />
                    Generate
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="pt-4">
                  <VideoUploadPanel setVideoUrl={setGeneratedVideoUrl} />
                </TabsContent>
                <TabsContent value="generate" className="pt-4">
                  <VideoGenerationPanel 
                    selectedProduct={selectedProduct}
                    setVideoUrl={setGeneratedVideoUrl}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Video Details</CardTitle>
              <CardDescription>Provide information about your video</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  placeholder="Enter video title" 
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter video description" 
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Select Product</Label>
                <ProductPicker 
                  selectedProductId={selectedProduct}
                  onProductSelect={setSelectedProduct}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <VideoPreviewPanel 
            videoUrl={generatedVideoUrl} 
            title={videoTitle}
            description={videoDescription}
          />
        </div>
      </div>
    </div>
  );
};

export default Videographer;
