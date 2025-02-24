import React from "react";
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
    <div className="max-w-[99.8rem] mx-auto">
      <div className="border-b border-gray-200 bg-white">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-medium text-gray-900">Content Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Review and manage AI-generated content suggestions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">Add Content</Button>
              <Button>View Calendar</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6 bg-gray-50 min-h-[calc(100vh-129px)]">
        <div className="grid gap-5 md:grid-cols-3">
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Pending Review</CardTitle>
              <CalendarClock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">12</div>
              <p className="text-sm text-gray-500">
                +2 from yesterday
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">Approved Today</CardTitle>
              <ThumbsUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">8</div>
              <p className="text-sm text-gray-500">
                +3 from yesterday
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">AI Suggestions</CardTitle>
              <Lightbulb className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">24</div>
              <p className="text-sm text-gray-500">
                Generated overnight
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <Tabs defaultValue="seasonality" className="w-full">
            <div className="border-b border-gray-200">
              <TabsList className="px-4 sm:px-6">
                <TabsTrigger 
                  value="seasonality"
                  className="py-4 px-4 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-[#008060]"
                >
                  Seasonality
                </TabsTrigger>
                <TabsTrigger 
                  value="catalog"
                  className="py-4 px-4 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-[#008060]"
                >
                  Catalog Updates
                </TabsTrigger>
                <TabsTrigger 
                  value="sales"
                  className="py-4 px-4 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-[#008060]"
                >
                  Sales Data
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4 sm:p-6">
              <TabsContent value="seasonality" className="mt-0">
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge className="bg-[#FDF8F3] text-[#C05717] hover:bg-[#FDF8F3]">
                          Seasonality
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardTitle className="text-base font-medium text-gray-900 mt-2">
                        Christmas Collection Launch
                      </CardTitle>
                      <CardDescription className="text-gray-500">
                        Holiday season campaign featuring new arrivals
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="aspect-video relative rounded-lg bg-gray-100 overflow-hidden">
                        <Image className="absolute inset-0 h-full w-full object-cover" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm"
                            className="bg-[#008060] hover:bg-[#006e52] text-white"
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-gray-300 text-gray-700"
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
                            <MessageCircle className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Star className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          Lookbook
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardTitle className="text-base font-medium text-gray-900 mt-2">
                        Winter Essentials
                      </CardTitle>
                      <CardDescription className="text-gray-500">
                        Curated collection of seasonal must-haves
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="aspect-video relative rounded-lg bg-gray-100 overflow-hidden">
                        <Image className="absolute inset-0 h-full w-full object-cover" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm"
                            className="bg-[#008060] hover:bg-[#006e52] text-white"
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-gray-300 text-gray-700"
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
                            <MessageCircle className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Star className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                          Video
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardTitle className="text-base font-medium text-gray-900 mt-2">
                        Holiday Gift Guide
                      </CardTitle>
                      <CardDescription className="text-gray-500">
                        Interactive video showcase of gift ideas
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="aspect-video relative rounded-lg bg-gray-100 overflow-hidden">
                        <Image className="absolute inset-0 h-full w-full object-cover" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm"
                            className="bg-[#008060] hover:bg-[#006e52] text-white"
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-gray-300 text-gray-700"
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
                            <MessageCircle className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Star className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="catalog" className="mt-0">
                <div className="text-center py-8 text-gray-500">
                  Catalog update suggestions will appear here
                </div>
              </TabsContent>

              <TabsContent value="sales" className="mt-0">
                <div className="text-center py-8 text-gray-500">
                  Sales-driven suggestions will appear here
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
