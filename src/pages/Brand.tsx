
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToneSelector } from "@/components/ToneSelector";
import { ToneChatbox } from "@/components/ToneChatbox";
import { ThemeGenerator } from "@/components/ThemeGenerator";
import { ThemeSelector } from "@/components/ThemeSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Slider } from "@/components/ui/slider";
import { ChevronRight, HomeIcon } from "lucide-react";

const Brand = () => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();
  const [brandName, setBrandName] = useState("");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [ageRange, setAgeRange] = useState([25, 45]);
  const [incomeLevel, setIncomeLevel] = useState<string>("medium");

  // Fetch existing brand data
  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data, error } = await supabase
          .from('brand_identity')
          .select('brand_name, gender, age_range_min, age_range_max, income_level')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setBrandName(data.brand_name || "");
          setSelectedGender(data.gender || "all");
          setAgeRange([data.age_range_min || 25, data.age_range_max || 45]);
          setIncomeLevel(data.income_level || "medium");
        }
      } catch (error) {
        console.error('Error fetching brand data:', error);
        toast({
          title: "Error",
          description: "Failed to load brand data",
          variant: "destructive",
        });
      }
    };

    fetchBrandData();
  }, [toast]);

  const handleGenerateClick = async () => {
    try {
      setGenerating(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from('brand_identity')
        .update({
          brand_name: brandName,
          gender: selectedGender,
          age_range_min: ageRange[0],
          age_range_max: ageRange[1],
          income_level: incomeLevel,
          tasks_completed: ['brand_identity']
        })
        .eq('user_id', session.user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Brand identity updated successfully",
      });
    } catch (error) {
      console.error('Error updating brand:', error);
      toast({
        title: "Error",
        description: "Failed to update brand identity",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-[99.8rem] mx-auto min-h-screen bg-[--p-background]">
      <div className="px-4 py-4 border-b border-[--p-border-subdued]">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">
              <HomeIcon className="h-4 w-4" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="/brand">Brand</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </div>
      
      <div className="p-4 md:p-6">
        <Tabs defaultValue="identity" className="space-y-4">
          <TabsList>
            <TabsTrigger value="identity">Identity</TabsTrigger>
            <TabsTrigger value="tone">Tone</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
          </TabsList>

          <TabsContent value="identity" className="space-y-8">
            <div className="space-y-4">
              <div>
                <Label htmlFor="brandName">Brand Name</Label>
                <Input
                  id="brandName"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-64"
                  placeholder="Enter brand name"
                />
              </div>

              <div>
                <Label>Target Audience Gender</Label>
                <RadioGroup value={selectedGender} onValueChange={setSelectedGender} className="flex gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all">All</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="non_binary" id="non_binary" />
                    <Label htmlFor="non_binary">Non-binary</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Age Range</Label>
                <div className="w-64 mt-2">
                  <Slider
                    value={ageRange}
                    onValueChange={setAgeRange}
                    min={18}
                    max={80}
                    step={1}
                  />
                  <div className="flex justify-between mt-1 text-sm text-gray-500">
                    <span>{ageRange[0]} years</span>
                    <span>{ageRange[1]} years</span>
                  </div>
                </div>
              </div>

              <div>
                <Label>Income Level</Label>
                <Select value={incomeLevel} onValueChange={setIncomeLevel}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerateClick}
                disabled={generating || !brandName.trim()}
                className="mt-4"
              >
                {generating ? "Generating..." : "Generate"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="tone">
            <div className="grid gap-4 md:grid-cols-2">
              <ToneSelector />
              <ToneChatbox />
            </div>
          </TabsContent>

          <TabsContent value="theme">
            <div className="grid gap-4 md:grid-cols-2">
              <ThemeSelector />
              <ThemeGenerator />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Brand;
