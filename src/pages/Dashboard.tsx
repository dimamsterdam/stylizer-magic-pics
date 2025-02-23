
import React from "react";
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CalendarClock, Image, MoreVertical, Star, ShoppingBag, ThumbsUp, MessageCircle, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  return (
    <div className="min-h-screen">
      <div className="p-4 sm:p-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-semibold text-gray-900">Content Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Review and manage AI-generated content suggestions
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="seasonality" className="space-y-4">
          <TabsList>
            <TabsTrigger value="seasonality">Seasonality</TabsTrigger>
            <TabsTrigger value="catalog">Catalog Updates</TabsTrigger>
            <TabsTrigger value="sales">Sales Data</TabsTrigger>
          </TabsList>

          <div className="grid gap-6">
            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    +2 from yesterday
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
                  <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">
                    +3 from yesterday
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Suggestions</CardTitle>
                  <Lightbulb className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">
                    Generated overnight
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Content Suggestions */}
            <TabsContent value="seasonality" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Seasonality</Badge>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg mt-2">Christmas Collection Launch</CardTitle>
                    <CardDescription>Holiday season campaign featuring new arrivals</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-video relative rounded-lg bg-gray-100 overflow-hidden">
                      <Image className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button size="sm" className="bg-primary">Approve</Button>
                        <Button size="sm" variant="outline">Adjust</Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <Star className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Similar cards for other content types */}
                <Card className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Lookbook</Badge>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg mt-2">Winter Essentials</CardTitle>
                    <CardDescription>Curated collection of seasonal must-haves</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-video relative rounded-lg bg-gray-100 overflow-hidden">
                      <Image className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button size="sm" className="bg-primary">Approve</Button>
                        <Button size="sm" variant="outline">Adjust</Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <Star className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Video</Badge>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg mt-2">Holiday Gift Guide</CardTitle>
                    <CardDescription>Interactive video showcase of gift ideas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-video relative rounded-lg bg-gray-100 overflow-hidden">
                      <Image className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button size="sm" className="bg-primary">Approve</Button>
                        <Button size="sm" variant="outline">Adjust</Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <Star className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="catalog" className="space-y-4">
              {/* Catalog Updates Content */}
              <div className="text-muted-foreground text-center py-8">
                Catalog update suggestions will appear here
              </div>
            </TabsContent>

            <TabsContent value="sales" className="space-y-4">
              {/* Sales Data Content */}
              <div className="text-muted-foreground text-center py-8">
                Sales-driven suggestions will appear here
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
